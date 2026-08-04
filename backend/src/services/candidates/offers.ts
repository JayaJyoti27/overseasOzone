import { supabase } from "../../config/supabase";
import { ConflictError, DatabaseError, NotFoundError } from "../../utils/AppError";
import { recordStatusChange } from "../admin/recruitment/statusHistory";

/*
|--------------------------------------------------------------------------
| Shape
|--------------------------------------------------------------------------
| offers has neither job_title nor company_name - both are joined in from
| job_orders/employers here and flattened onto the row, since that's the
| shape the frontend (OfferCard.tsx) expects.
*/

const OFFER_SELECT = `
  *,
  job_order:job_orders( title ),
  employer:employers( company_name )
`;

function toApiShape(row: any) {
  if (!row) return row;
  const { job_order, employer, ...rest } = row;
  return {
    ...rest,
    job_title: job_order?.title ?? "—",
    company_name: employer?.company_name ?? "—",
  };
}

/*
|--------------------------------------------------------------------------
| My Offers
|--------------------------------------------------------------------------
*/

export async function getCandidateOffers(candidateId: string) {
  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_SELECT)
    .eq("candidate_id", candidateId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new DatabaseError("Unable to fetch offers.", error);
  }

  return (data ?? []).map(toApiShape);
}

/*
|--------------------------------------------------------------------------
| Offer Details
|--------------------------------------------------------------------------
*/

export async function getCandidateOffer(candidateId: string, offerId: string) {
  const { data, error } = await supabase
    .from("offers")
    .select(OFFER_SELECT)
    .eq("candidate_id", candidateId)
    .eq("id", offerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Offer not found.");
  }

  return toApiShape(data);
}

/*
|--------------------------------------------------------------------------
| Accept Offer
|--------------------------------------------------------------------------
*/

export async function acceptOffer(candidateId: string, offerId: string) {
  const { data, error } = await supabase
    .from("offers")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("candidate_id", candidateId)
    .eq("id", offerId)
    // Only a still-pending offer can be accepted - guards against double
    // accept/reject and stale button clicks.
    .eq("status", "sent")
    .select()
    .single();

  if (error || !data) {
    throw new ConflictError("This offer has already been responded to, or doesn't exist.");
  }

  // Per the spec's Application Tracker: Offer Letter Issued -> Documents
  // Verification is the next stage once the candidate accepts. Synced the
  // same way every other stage transition in this app is (recordStatusChange),
  // so admin/employer see it immediately without extra notification wiring.
  await supabase
    .from("applications")
    .update({
      internal_status: "documents_verification",
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "documents_verification", {
    changedBy: candidateId,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Reject Offer
|--------------------------------------------------------------------------
*/

export async function rejectOffer(candidateId: string, offerId: string, reason?: string) {
  const { data, error } = await supabase
    .from("offers")
    .update({
      status: "rejected",
      notes: reason,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("candidate_id", candidateId)
    .eq("id", offerId)
    .eq("status", "sent")
    .select()
    .single();

  if (error || !data) {
    throw new ConflictError("This offer has already been responded to, or doesn't exist.");
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "rejected",
      admin_notes: reason,
      closed_at: new Date().toISOString(),
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "rejected", {
    changedBy: candidateId,
    notes: reason,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Latest Active Offer
|--------------------------------------------------------------------------
*/

export async function getLatestOffer(candidateId: string) {
  const offers = await getCandidateOffers(candidateId);

  return (
    offers.find(
      (offer) =>
        offer.status !== "accepted" && offer.status !== "rejected" && offer.status !== "expired",
    ) ?? null
  );
}

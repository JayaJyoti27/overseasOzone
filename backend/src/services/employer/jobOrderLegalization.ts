import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";
import {
  initializeLegalizationChecklist,
  LEGALIZATION_REACHED_STATUSES,
} from "../admin/legalizationDocuments";
import { LegalizationDocument } from "../../types/legalizationDocument";

/*
|--------------------------------------------------------------------------
| Get Employer's Legalization Documents
|--------------------------------------------------------------------------
| Returns the full checklist for a job order that belongs to this
| employer. Previously this was scoped to only the 3 employer-owned items
| (Demand Letter, Specimen Employment Contract, Power of Attorney), with
| the other 5 (embassy/PoE attestations etc.) handled exclusively by ops.
| In practice employers are often the ones who actually have those extra
| attestation documents in hand, so all checklist items are now visible
| and uploadable here - EMPLOYER_OWNED_DOCUMENT_TYPES is only used for
| badging on the admin side now, not for gating employer access.
|--------------------------------------------------------------------------
*/

export async function getEmployerLegalizationDocuments(
  employerId: string,
  jobOrderId: string,
): Promise<LegalizationDocument[]> {
  await assertJobOrderBelongsToEmployer(employerId, jobOrderId);

  const { data, error } = await supabase
    .from("job_order_legalization_documents")
    .select("*")
    .eq("job_order_id", jobOrderId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new DatabaseError("Unable to fetch legalization documents.", error);
  }

  if (data && data.length > 0) {
    return data;
  }

  const { data: jobOrder } = await supabase
    .from("job_orders")
    .select("status")
    .eq("id", jobOrderId)
    .single();

  if (jobOrder && LEGALIZATION_REACHED_STATUSES.includes(jobOrder.status)) {
    await initializeLegalizationChecklist(jobOrderId);

    const { data: seeded, error: seededError } = await supabase
      .from("job_order_legalization_documents")
      .select("*")
      .eq("job_order_id", jobOrderId)
      .order("created_at", { ascending: true });

    if (seededError) {
      throw new DatabaseError("Unable to fetch legalization documents.", seededError);
    }

    return seeded ?? [];
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| Upload a Document
|--------------------------------------------------------------------------
| Attaches the uploaded file_url and moves the item pending -> submitted.
| Employers can only submit, never attest - final verification stays with
| admin, since attestation is what actually gates recruitment.
|--------------------------------------------------------------------------
*/

export async function uploadEmployerLegalizationDocument(
  employerId: string,
  jobOrderId: string,
  documentId: string,
  fileUrl: string,
): Promise<LegalizationDocument> {
  await assertJobOrderBelongsToEmployer(employerId, jobOrderId);

  const { data: existing, error: fetchError } = await supabase
    .from("job_order_legalization_documents")
    .select("id, document_type, job_order_id")
    .eq("id", documentId)
    .single();

  if (fetchError || !existing) {
    throw new NotFoundError("Legalization document not found.");
  }

  if (existing.job_order_id !== jobOrderId) {
    throw new NotFoundError("Legalization document not found.");
  }

  const { data, error } = await supabase
    .from("job_order_legalization_documents")
    .update({
      file_url: fileUrl,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      updated_by: employerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to save the uploaded document.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Ownership Guard
|--------------------------------------------------------------------------
*/

async function assertJobOrderBelongsToEmployer(employerId: string, jobOrderId: string) {
  const { data, error } = await supabase
    .from("job_orders")
    .select("id")
    .eq("id", jobOrderId)
    .eq("employer_id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Job order not found.");
  }
}

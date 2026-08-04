import { supabase } from "../../config/supabase";
import { EMPLOYER_VISIBLE_STATUSES, APPLICATION_STATUS_FLOW } from "../../constants/applicationStatus";
import { ConflictError, DatabaseError, NotFoundError } from "../../utils/AppError";
import { recordStatusChange } from "../admin/recruitment/statusHistory";
import { completeInterview as completeInterviewCore } from "../admin/recruitment/interview";

/*
|--------------------------------------------------------------------------
| Field Mapping
|--------------------------------------------------------------------------
| The `candidates` table's real column names (name, current_country,
| passport_expiry) don't match what the frontend expects (full_name,
| current_location, passport_expiry_date). Translate at this boundary,
| same convention as services/candidates/profile.ts.
*/

function toApiShape(row: any) {
  if (!row) return row;
  const { name, current_country, passport_expiry, ...rest } = row;
  return {
    ...rest,
    full_name: name,
    current_location: current_country,
    passport_expiry_date: passport_expiry,
  };
}

/*
|--------------------------------------------------------------------------
| Candidate Detail
|--------------------------------------------------------------------------
| Only visible once the candidate has been shortlisted (or moved further
| along the pipeline) on at least one application for this employer's job
| orders. Applications still at applied/application_received/cv_under_review
| are pre-review and stay hidden — see EMPLOYER_VISIBLE_STATUSES.
*/

export async function getEmployerCandidate(employerId: string, candidateId: string) {
  const { data: applications, error: appError } = await supabase
    .from("applications")
    .select(
      `
      id, status, internal_status, applied_at,
      job:job_orders!inner( id, title, country, employer_id )
    `,
    )
    .eq("candidate_id", candidateId)
    .eq("employer_id", employerId)
    .in("internal_status", EMPLOYER_VISIBLE_STATUSES)
    .order("applied_at", { ascending: false });

  if (appError) {
    console.error(`[getEmployerCandidate] applications query failed for candidate ${candidateId}:`, appError);
    throw new DatabaseError("Unable to fetch candidate applications.", appError);
  }
  if (!applications || applications.length === 0) {
    // Covers: not this employer's candidate, candidate doesn't exist, and
    // "shortlisted yet" — none of these should be distinguishable to the
    // employer, so a single 404 is intentional.
    throw new NotFoundError("Candidate not found.");
  }

  const { data: candidate, error: candError } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (candError || !candidate) throw new NotFoundError("Candidate not found.");

  const { data: documents } = await supabase
    .from("documents")
    .select(
      `
        id,
        document_type,
        file_name,
        original_file_name,
        public_url,
        status,
        verified_at,
        expires_at
      `,
    )
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("application_id", applications[0].id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    candidate: toApiShape(candidate),
    applications,
    // The most recent application drives the header status + action gating
    // (reject / schedule) on the candidate detail page.
    application: applications[0],
    documents: documents ?? [],
    resume: documents?.find((d) => d.document_type === "resume") ?? null,
    interview: interview ?? null,
  };
}

/*
|--------------------------------------------------------------------------
| Candidate List (all candidates who applied to this employer's job orders)
|--------------------------------------------------------------------------
*/

export async function getEmployerCandidates(employerId: string) {
  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      `
        id,
        status,
        internal_status,
        applied_at,
        candidate:candidates(
          id,
          full_name:name,
          email,
          phone,
          preferred_country
        ),
        job:job_orders!inner(
          id,
          title,
          employer_id
        )
      `,
    )
    .eq("employer_id", employerId)
    .in("internal_status", EMPLOYER_VISIBLE_STATUSES)
    .order("applied_at", { ascending: false });

  if (error) throw new DatabaseError("Unable to fetch candidates.", error);

  // One row per candidate — keep their most recent application only
  const seen = new Set<string>();
  const candidates: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    position: string;
    status: string;
    applied_at: string;
  }> = [];

  for (const app of applications ?? []) {
    const candidate = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
    const job = Array.isArray(app.job) ? app.job[0] : app.job;

    if (!candidate?.id || seen.has(candidate.id)) continue;
    seen.add(candidate.id);

    candidates.push({
      id: candidate.id,
      name: candidate.full_name ?? "—",
      email: candidate.email ?? "—",
      phone: candidate.phone ?? "—",
      country: candidate.preferred_country ?? "—",
      position: job?.title ?? "—",
      status: app.status ?? "—",
      applied_at: app.applied_at,
    });
  }

  return candidates;
}

/*
|--------------------------------------------------------------------------
| Reject Candidate
|--------------------------------------------------------------------------
| Employer-initiated rejection, only allowed once the candidate is already
| visible to them (shortlisted or later). Mirrors admin's
| rejectApplication, but scoped to this employer's own application.
*/

export async function rejectEmployerCandidate(
  employerId: string,
  candidateId: string,
  reason: string,
) {
  const application = await getEmployerVisibleApplication(employerId, candidateId);

  const { data, error } = await supabase
    .from("applications")
    .update({
      internal_status: "rejected",
      admin_notes: reason,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to reject candidate.", error);

  await recordStatusChange(application.id, "rejected", {
    changedBy: employerId,
    notes: reason,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Schedule Interview
|--------------------------------------------------------------------------
| Employer-initiated scheduling, only valid from "employer_shortlisted"
| (the same gate APPLICATION_STATUS_FLOW enforces for everyone else).
*/

interface ScheduleInterviewPayload {
  interview_date: string;
  mode: string;
  meeting_link?: string;
  location?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  interviewer_phone?: string;
  notes?: string;
}

export async function scheduleEmployerInterview(
  employerId: string,
  candidateId: string,
  payload: ScheduleInterviewPayload,
) {
  const application = await getEmployerVisibleApplication(employerId, candidateId);

  const allowedNext = APPLICATION_STATUS_FLOW[application.internal_status as keyof typeof APPLICATION_STATUS_FLOW];
  if (!allowedNext?.includes("interview_scheduled")) {
    throw new ConflictError(
      "This candidate isn't at the shortlisted stage yet, so an interview can't be scheduled.",
    );
  }

  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .insert({
      application_id: application.id,
      job_order_id: application.job_order_id,
      scheduled_by: employerId,
      interview_date: payload.interview_date,
      mode: payload.mode,
      meeting_link: payload.meeting_link,
      location: payload.location,
      interviewer_name: payload.interviewer_name,
      interviewer_email: payload.interviewer_email,
      interviewer_phone: payload.interviewer_phone,
      notes: payload.notes,
      status: "scheduled",
    })
    .select()
    .single();

  if (interviewError) throw new DatabaseError("Unable to schedule interview.", interviewError);

  await supabase
    .from("applications")
    .update({
      internal_status: "interview_scheduled",
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id);

  await recordStatusChange(application.id, "interview_scheduled", { changedBy: employerId });

  return interview;
}

/*
|--------------------------------------------------------------------------
| Shared helper — fetch the employer-visible application for a candidate
|--------------------------------------------------------------------------
*/

async function getEmployerVisibleApplication(employerId: string, candidateId: string) {
  const { data: application, error } = await supabase
    .from("applications")
    .select("id, internal_status, job_order_id")
    .eq("candidate_id", candidateId)
    .eq("employer_id", employerId)
    .in("internal_status", EMPLOYER_VISIBLE_STATUSES)
    .order("applied_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new DatabaseError("Unable to fetch candidate application.", error);
  if (!application) throw new NotFoundError("Candidate not found.");

  return application;
}

/*
|--------------------------------------------------------------------------
| Complete Interview (mark done: selected / rejected)
|--------------------------------------------------------------------------
| Employer marks the interview they conducted as done, with an outcome.
| This reuses the exact same admin/recruitment/interview.ts completeInterview
| logic that already syncs applications.internal_status ("selected" or
| "rejected") and writes an application_status_history row - the same
| mechanism scheduleEmployerInterview above relies on, so this shows up on
| the admin side automatically, no separate notification wiring needed.
| Selecting a candidate here is what the admin recruitment flow watches for
| to move an application toward offer issuance next.
*/

export async function completeEmployerInterview(
  employerId: string,
  candidateId: string,
  result: "selected" | "rejected",
  feedback?: string,
) {
  const application = await getEmployerVisibleApplication(employerId, candidateId);

  if (application.internal_status !== "interview_scheduled") {
    throw new ConflictError(
      "This candidate doesn't have an interview awaiting an outcome right now.",
    );
  }

  const { data: interview, error } = await supabase
    .from("interviews")
    .select("id, status")
    .eq("application_id", application.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !interview) {
    throw new NotFoundError("No interview found for this candidate.");
  }

  if (interview.status === "completed") {
    throw new ConflictError("This interview has already been marked as done.");
  }

  return completeInterviewCore(interview.id, result, feedback, employerId);
}

/*
|--------------------------------------------------------------------------
| Issue Offer Letter
|--------------------------------------------------------------------------
| The candidate's Offers page reads from the `offers` table (salary,
| currency, joining_date, offer_letter_url, status) - not the generic
| documents table. So uploading a file alone would be invisible there.
| This upserts a matching offers row, pulling salary/currency/duration/
| country from the job order, and moves the application on to
| offer_letter_issued the same way scheduleEmployerInterview /
| completeEmployerInterview already do for their stages.
*/

export async function issueOfferLetter(
  employerId: string,
  candidateId: string,
  offerLetterUrl: string,
) {
  const application = await getEmployerVisibleApplication(employerId, candidateId);

  if (application.internal_status !== "selected") {
    throw new ConflictError(
      "An offer letter can only be issued once the candidate has been marked as selected.",
    );
  }

  const { data: jobOrder } = await supabase
    .from("job_orders")
    .select("salary_min, salary_max, currency, contract_duration, country")
    .eq("id", application.job_order_id)
    .maybeSingle();

  const { data: existingOffer } = await supabase
    .from("offers")
    .select("id")
    .eq("application_id", application.id)
    .maybeSingle();

  const offerFields = {
    application_id: application.id,
    job_order_id: application.job_order_id,
    employer_id: employerId,
    candidate_id: candidateId,
    salary: jobOrder?.salary_max ?? jobOrder?.salary_min ?? null,
    currency: jobOrder?.currency ?? null,
    contract_duration: jobOrder?.contract_duration ?? null,
    location: jobOrder?.country ?? null,
    offer_letter_url: offerLetterUrl,
    status: "sent" as const,
    sent_at: new Date().toISOString(),
    created_by: employerId,
    updated_at: new Date().toISOString(),
  };

  const { data: offer, error } = existingOffer
    ? await supabase.from("offers").update(offerFields).eq("id", existingOffer.id).select().single()
    : await supabase.from("offers").insert(offerFields).select().single();

  if (error || !offer) {
    throw new DatabaseError("Unable to issue offer letter.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "offer_letter_issued",
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id);

  await recordStatusChange(application.id, "offer_letter_issued", { changedBy: employerId });

  return offer;
}

/*
|--------------------------------------------------------------------------
| Approve Documents Verification
|--------------------------------------------------------------------------
| Employer reviews what the candidate has uploaded and approves, advancing
| documents_verification -> medical (the doc's spec: Documents Verification
| -> Medical -> Visa Processing -> ... -> Deployed). Same
| gate-check-then-recordStatusChange pattern as every other action here.
*/

export async function approveDocumentsVerification(employerId: string, candidateId: string) {
  const application = await getEmployerVisibleApplication(employerId, candidateId);

  if (application.internal_status !== "documents_verification") {
    throw new ConflictError(
      "This candidate isn't at the documents verification stage right now.",
    );
  }

  const { error } = await supabase
    .from("applications")
    .update({
      internal_status: "medical",
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id);

  if (error) {
    throw new DatabaseError("Unable to approve documents.", error);
  }

  await recordStatusChange(application.id, "medical", { changedBy: employerId });

  return { application_id: application.id, internal_status: "medical" };
}

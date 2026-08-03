export const APPLICATION_STATUSES = [
  "applied",
  "application_received",
  "cv_under_review",
  "employer_shortlisted",
  "interview_scheduled",
  "interview_completed",
  "selected",
  "offer_letter_issued",
  "documents_verification",
  "medical",
  "visa_processing",
  "visa_approved",
  "ticket_confirmed",
  "deployed",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_FLOW: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ["application_received", "withdrawn", "rejected"],

  application_received: ["cv_under_review", "withdrawn", "rejected"],

  cv_under_review: ["employer_shortlisted", "rejected"],

  employer_shortlisted: ["interview_scheduled", "rejected"],

  interview_scheduled: ["interview_completed", "rejected"],

  interview_completed: ["selected", "rejected"],

  selected: ["offer_letter_issued", "rejected"],

  offer_letter_issued: ["documents_verification", "rejected"],

  documents_verification: ["medical", "rejected"],

  medical: ["visa_processing", "rejected"],

  visa_processing: ["visa_approved", "rejected"],

  visa_approved: ["ticket_confirmed", "rejected"],

  ticket_confirmed: ["deployed", "rejected"],

  deployed: [],

  rejected: [],

  withdrawn: [],
};

/*
|--------------------------------------------------------------------------
| Candidate Visibility
|--------------------------------------------------------------------------
| Mirrors the split documented in
| supabase/migrations/20260803_001_application_status_history.sql.
|
| `applications.internal_status` can be set to any of the 16 values above.
| `applications.status` (what a candidate sees) should only ever be set to
| one of the 14 CANDIDATE_VISIBLE_STATUSES below — the other 2 are internal
| recruiter/admin bookkeeping stages a candidate should never see.
*/

export const INTERNAL_ONLY_STATUSES: ApplicationStatus[] = ["application_received", "cv_under_review"];

export const CANDIDATE_VISIBLE_STATUSES: ApplicationStatus[] = APPLICATION_STATUSES.filter(
  (status) => !(INTERNAL_ONLY_STATUSES as string[]).includes(status),
);

export function isCandidateVisibleStatus(status: string): status is ApplicationStatus {
  return (CANDIDATE_VISIBLE_STATUSES as string[]).includes(status);
}

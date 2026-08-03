// Single source of truth for application status display + workflow logic
// on the frontend. Mirrors backend/src/constants/applicationStatus.ts
// (APPLICATION_STATUSES, APPLICATION_STATUS_FLOW) - the backend is the
// real source of truth and re-validates every transition server-side;
// this file only controls which options the stage-select UI offers.
//
// Kept framework-free (no React/DOM imports) so it can be unit tested in
// isolation and reused across admin application pages.

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

export function isApplicationStatus(value?: string | null): value is ApplicationStatus {
  return !!value && (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  application_received: "Application Received",
  cv_under_review: "CV Under Review",
  employer_shortlisted: "Employer Shortlisted",
  interview_scheduled: "Interview Scheduled",
  interview_completed: "Interview Completed",
  selected: "Selected",
  offer_letter_issued: "Offer Letter Issued",
  documents_verification: "Documents Verification",
  medical: "Medical",
  visa_processing: "Visa Processing",
  visa_approved: "Visa Approved",
  ticket_confirmed: "Ticket Confirmed",
  deployed: "Deployed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: "bg-blue-wash text-blue",
  application_received: "bg-blue-wash text-blue",
  cv_under_review: "bg-amber-50 text-amber-700",
  employer_shortlisted: "bg-amber-50 text-amber-700",
  interview_scheduled: "bg-purple-50 text-purple-700",
  interview_completed: "bg-purple-50 text-purple-700",
  selected: "bg-green-50 text-green-700",
  offer_letter_issued: "bg-green-50 text-green-700",
  documents_verification: "bg-amber-50 text-amber-700",
  medical: "bg-amber-50 text-amber-700",
  visa_processing: "bg-amber-50 text-amber-700",
  visa_approved: "bg-green-50 text-green-700",
  ticket_confirmed: "bg-green-50 text-green-700",
  deployed: "bg-navy text-white",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-muted text-muted-foreground",
};

// Mirrors APPLICATION_STATUS_FLOW in backend/src/constants/applicationStatus.ts.
// Every stage's array is the set of statuses the backend will actually
// accept moving to from there - the dropdown only ever offers these, so
// an admin can't pick something the PATCH will 400 on.
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

/** Pure function: valid next stages for a given current status. */
export function getNextStages(currentStatus?: string | null): ApplicationStatus[] {
  if (!isApplicationStatus(currentStatus)) return [];
  return APPLICATION_STATUS_FLOW[currentStatus] ?? [];
}

/**
 * The single "forward progress" stage out of a status's valid next
 * stages (i.e. excluding the always-available rejected/withdrawn exits).
 * Used to default the dropdown's selection and to decide whether a
 * one-click "Advance" button can be shown at all - only when there's
 * exactly one such stage, which is true for every non-terminal status in
 * this flow.
 */
export function getForwardStage(currentStatus?: string | null): ApplicationStatus | null {
  const next = getNextStages(currentStatus).filter(
    (status) => status !== "rejected" && status !== "withdrawn",
  );

  return next.length === 1 ? next[0] : null;
}

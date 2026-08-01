// Single source of truth for job order status display + workflow logic.
// Mirrors backend/src/types/jobOrder.ts JOB_ORDER_STATUSES and the guarded
// transitions in backend/src/services/admin/jobOrders.ts.
//
// Kept framework-free (no React/DOM imports) so it can be unit tested in
// isolation and reused by the list page, detail page, and timeline.

export const JOB_ORDER_STATUSES = [
  "requirement_submitted",
  "under_admin_review",
  "clarification_required",
  "employer_approval_pending",
  "legalization_in_progress",
  "approved_for_recruitment",
  "recruitment_open",
  "recruitment_closed",
  "candidate_selected",
  "visa_processing",
  "deployment_completed",
  "cancelled",
] as const;

export type JobOrderStatus = (typeof JOB_ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<JobOrderStatus, string> = {
  requirement_submitted: "Requirement Submitted",
  under_admin_review: "Under Admin Review",
  clarification_required: "Employer Clarification Required",
  employer_approval_pending: "Employer Approval Pending",
  legalization_in_progress: "Legalization in Progress",
  approved_for_recruitment: "Approved for Recruitment",
  recruitment_open: "Recruitment Open",
  recruitment_closed: "Recruitment Closed",
  candidate_selected: "Candidate Selected",
  visa_processing: "Visa Processing",
  deployment_completed: "Deployment Completed",
  cancelled: "Cancelled",
};

export const STATUS_STYLES: Record<JobOrderStatus, string> = {
  requirement_submitted: "bg-blue-wash text-blue",
  under_admin_review: "bg-amber-50 text-amber-700",
  clarification_required: "bg-orange-50 text-orange-700",
  employer_approval_pending: "bg-amber-50 text-amber-700",
  legalization_in_progress: "bg-violet-50 text-violet-700",
  approved_for_recruitment: "bg-sky-50 text-sky-700",
  recruitment_open: "bg-emerald-50 text-emerald-700",
  recruitment_closed: "bg-red-50 text-red-700",
  candidate_selected: "bg-emerald-50 text-emerald-700",
  visa_processing: "bg-violet-50 text-violet-700",
  deployment_completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const DEFAULT_STYLE = "bg-blue-wash text-blue";

export function isJobOrderStatus(value?: string | null): value is JobOrderStatus {
  return !!value && (JOB_ORDER_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(status?: string | null): string {
  if (isJobOrderStatus(status)) return STATUS_LABELS[status];
  return status || "Unknown";
}

export function statusStyle(status?: string | null): string {
  if (isJobOrderStatus(status)) return STATUS_STYLES[status];
  return DEFAULT_STYLE;
}

// Ordered "happy path" stages shown on the timeline. Branch/exit statuses
// (clarification_required, cancelled) are intentionally excluded from the
// linear rail and surfaced separately by the timeline component instead.
export const TIMELINE_STAGES: JobOrderStatus[] = [
  "requirement_submitted",
  "under_admin_review",
  "employer_approval_pending",
  "legalization_in_progress",
  "approved_for_recruitment",
  "recruitment_open",
  "recruitment_closed",
];

export type TimelineStageState = "complete" | "current" | "upcoming";

export interface TimelineStage {
  status: JobOrderStatus;
  label: string;
  state: TimelineStageState;
}

/**
 * Pure function: given the job order's current status, returns the ordered
 * timeline stages annotated with complete/current/upcoming. If the job order
 * is currently in a branch status (clarification_required, cancelled) not on
 * the main rail, the stage it branched from is shown as "current".
 */
export function getTimelineStages(currentStatus?: string | null): TimelineStage[] {
  let effectiveIndex = TIMELINE_STAGES.findIndex((s) => s === currentStatus);

  // clarification_required branches off of under_admin_review; treat that
  // rail position as "current" while flagged for clarification.
  if (effectiveIndex === -1 && currentStatus === "clarification_required") {
    effectiveIndex = TIMELINE_STAGES.indexOf("under_admin_review");
  }

  // Terminal downstream statuses (candidate_selected, visa_processing,
  // deployment_completed) mean the whole rail is complete.
  if (
    effectiveIndex === -1 &&
    (currentStatus === "candidate_selected" ||
      currentStatus === "visa_processing" ||
      currentStatus === "deployment_completed")
  ) {
    effectiveIndex = TIMELINE_STAGES.length; // past the end -> everything complete
  }

  return TIMELINE_STAGES.map((status, index) => ({
    status,
    label: STATUS_LABELS[status],
    state:
      effectiveIndex === -1
        ? "upcoming"
        : index < effectiveIndex
          ? "complete"
          : index === effectiveIndex
            ? "current"
            : "upcoming",
  }));
}

export type JobOrderAction =
  | "startAdminReview"
  | "requestClarification"
  | "sendForEmployerApproval"
  | "startLegalization"
  | "approveForRecruitment"
  | "openRecruitment"
  | "closeRecruitment";

export interface JobOrderActionDef {
  action: JobOrderAction;
  label: string;
  variant?: "default" | "destructive" | "secondary";
  requiresNote?: boolean;
}

// Mirrors the `allowedFrom` arrays in backend/src/services/admin/jobOrders.ts.
// If this list and the backend ever drift, the backend is the source of
// truth and will reject the request with a 400 - this only controls which
// buttons are offered.
const ACTIONS_BY_STATUS: Partial<Record<JobOrderStatus, JobOrderActionDef[]>> = {
  requirement_submitted: [{ action: "startAdminReview", label: "Start Admin Review" }],
  clarification_required: [{ action: "startAdminReview", label: "Resume Admin Review" }],
  under_admin_review: [
    { action: "sendForEmployerApproval", label: "Send for Employer Approval" },
    {
      action: "requestClarification",
      label: "Request Employer Clarification",
      variant: "secondary",
      requiresNote: true,
    },
  ],
  employer_approval_pending: [{ action: "startLegalization", label: "Start Legalization" }],
  legalization_in_progress: [{ action: "approveForRecruitment", label: "Approve for Recruitment" }],
  approved_for_recruitment: [{ action: "openRecruitment", label: "Open Recruitment" }],
  recruitment_open: [
    { action: "closeRecruitment", label: "Close Recruitment", variant: "destructive" },
  ],
};

/** Pure function: valid next actions for a given current status. */
export function getAvailableActions(currentStatus?: string | null): JobOrderActionDef[] {
  if (!isJobOrderStatus(currentStatus)) return [];
  return ACTIONS_BY_STATUS[currentStatus] ?? [];
}

// Mirrors the status values set in backend/src/services/admin/requirements.ts
// and backend/src/services/employer/requirement.ts. Deliberately separate from
// jobOrderStatus.ts - requirements and job_orders use different status strings
// for their own lifecycle ("under_review" vs "under_admin_review" etc.)

export const REQUIREMENT_STATUS_LABELS: Record<string, string> = {
  submitted: "Requirement Submitted",
  under_review: "Under Admin Review",
  clarification_required: "Clarification Required",
  approved: "Approved by Admin",
  rejected: "Rejected",
  converted: "Converted to Job Order",
  withdrawn: "Withdrawn",
};

export const REQUIREMENT_STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-wash text-blue",
  under_review: "bg-amber-50 text-amber-700",
  clarification_required: "bg-orange-50 text-orange-700",
  approved: "bg-purple-50 text-purple-700",
  rejected: "bg-red-50 text-red-700",
  converted: "bg-emerald-50 text-emerald-700",
  withdrawn: "bg-gray-100 text-gray-600",
};

export function requirementStatusLabel(status?: string) {
  const key = (status || "").toLowerCase();
  return REQUIREMENT_STATUS_LABELS[key] ?? status ?? "-";
}

export function requirementStatusStyle(status?: string) {
  const key = (status || "").toLowerCase();
  return REQUIREMENT_STATUS_STYLES[key] ?? "bg-blue-wash text-blue";
}

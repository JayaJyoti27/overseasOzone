// Single source of truth for legalization checklist display + completeness
// logic. Mirrors backend/src/types/legalizationDocument.ts and the gate in
// backend/src/services/admin/legalizationDocuments.ts (isLegalizationComplete).
//
// Kept framework-free (no React/DOM imports) so it can be unit tested in
// isolation and reused by the admin checklist panel.

export const LEGALIZATION_DOCUMENT_STATUSES = [
  "pending",
  "submitted",
  "attested",
  "rejected",
] as const;

export type LegalizationDocumentStatus = (typeof LEGALIZATION_DOCUMENT_STATUSES)[number];

export const DOCUMENT_STATUS_LABELS: Record<LegalizationDocumentStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  attested: "Attested",
  rejected: "Rejected",
};

export const DOCUMENT_STATUS_STYLES: Record<LegalizationDocumentStatus, string> = {
  pending: "bg-blue-wash text-blue",
  submitted: "bg-amber-50 text-amber-700",
  attested: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export interface LegalizationDocument {
  id: string;
  job_order_id: string;
  document_type: string;
  label: string;
  authority?: string | null;
  is_required: boolean;
  status: LegalizationDocumentStatus;
  reference_number?: string | null;
  file_url?: string | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Of the 8 checklist items, only these 3 originate from the employer
// (authority: "Foreign Employer") - the rest are embassy/PoE attestations
// the ops team obtains directly. Used to badge rows so admins know which
// ones they should expect the employer to have uploaded a file for.
export const EMPLOYER_OWNED_DOCUMENT_TYPES = [
  "demand_letter",
  "specimen_employment_contract",
  "power_of_attorney",
] as const;

export function isEmployerOwnedDocument(documentType: string): boolean {
  return (EMPLOYER_OWNED_DOCUMENT_TYPES as readonly string[]).includes(documentType);
}

export function documentStatusLabel(status?: string | null): string {
  if (status && status in DOCUMENT_STATUS_LABELS) {
    return DOCUMENT_STATUS_LABELS[status as LegalizationDocumentStatus];
  }
  return status || "Unknown";
}

export function documentStatusStyle(status?: string | null): string {
  if (status && status in DOCUMENT_STATUS_STYLES) {
    return DOCUMENT_STATUS_STYLES[status as LegalizationDocumentStatus];
  }
  return "bg-blue-wash text-blue";
}

/**
 * Pure function mirroring the backend's isLegalizationComplete(): every
 * required item must be attested. An empty/never-seeded checklist is never
 * complete.
 */
export function isChecklistComplete(checklist: LegalizationDocument[]): boolean {
  const required = checklist.filter((item) => item.is_required);
  if (required.length === 0) return false;
  return required.every((item) => item.status === "attested");
}

export const LEGALIZATION_DOCUMENT_TYPES = [
  "demand_letter",
  "specimen_employment_contract",
  "power_of_attorney",
  "local_chamber_attestation",
  "destination_mofa_attestation",
  "indian_mission_attestation",
  "poe_recruitment_permission",
  "recruiting_agent_registration_certificate",
  "other",
] as const;

export type LegalizationDocumentType = (typeof LEGALIZATION_DOCUMENT_TYPES)[number];

export const LEGALIZATION_DOCUMENT_STATUSES = [
  "pending",
  "submitted",
  "attested",
  "rejected",
] as const;

export type LegalizationDocumentStatus = (typeof LEGALIZATION_DOCUMENT_STATUSES)[number];

export interface LegalizationDocument {
  id: string;

  job_order_id: string;

  document_type: LegalizationDocumentType;

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

export interface UpdateLegalizationDocumentInput {
  status?: LegalizationDocumentStatus;
  reference_number?: string;
  notes?: string;
  authority?: string;
  // Whether this document is required for this specific job order. Not
  // fixed per document type - destination/skill-category dependent, so
  // admins can flip it per job order instead of it being hardcoded true.
  is_required?: boolean;
}

import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";
import {
  LegalizationDocument,
  LegalizationDocumentType,
  UpdateLegalizationDocumentInput,
} from "../../types/legalizationDocument";

/*
|--------------------------------------------------------------------------
| Default Checklist
|--------------------------------------------------------------------------
| Based on the actual Indian Emigration Act 1983 / Protector General of
| Emigrants (PGE/MEA) process for overseas recruitment:
|
|   - Demand Letter, Specimen Employment Contract and Power of Attorney
|     must be obtained from the foreign employer before recruitment can
|     even be advertised.
|   - For unskilled/women workers headed to ECR (Emigration Check
|     Required) countries, those documents must additionally be attested
|     by the Indian Mission (Embassy/Consulate) in the destination
|     country.
|   - The Recruiting Agent then needs Protector of Emigrants (PoE)
|     permission against that demand letter before recruitment can open.
|
| `is_required: false` items are destination/skill-category dependent
| (e.g. local Chamber of Commerce attestation is only needed for some
| Gulf countries) - admins can flip them on per job order instead of us
| guessing wrong for every country.
|--------------------------------------------------------------------------
*/

const DEFAULT_CHECKLIST: Array<{
  document_type: LegalizationDocumentType;
  label: string;
  authority: string;
  is_required: boolean;
}> = [
  {
    document_type: "demand_letter",
    label: "Demand Letter",
    authority: "Foreign Employer",
    is_required: true,
  },
  {
    document_type: "specimen_employment_contract",
    label: "Specimen Employment Contract",
    authority: "Foreign Employer",
    is_required: true,
  },
  {
    document_type: "power_of_attorney",
    label: "Power of Attorney",
    authority: "Foreign Employer",
    is_required: true,
  },
  {
    document_type: "local_chamber_attestation",
    label: "Local Chamber of Commerce Attestation",
    authority: "Destination-country Chamber of Commerce",
    is_required: false,
  },
  {
    document_type: "destination_mofa_attestation",
    label: "Destination Ministry of Foreign Affairs Attestation",
    authority: "Destination-country Ministry of Foreign Affairs",
    is_required: false,
  },
  {
    document_type: "indian_mission_attestation",
    label: "Indian Mission Attestation of Employment Documents",
    authority: "Indian Embassy / Consulate (destination country)",
    is_required: true,
  },
  {
    document_type: "poe_recruitment_permission",
    label: "Protector of Emigrants - Permission to Recruit (Form VI)",
    authority: "Protector of Emigrants (PoE)",
    is_required: true,
  },
  {
    document_type: "recruiting_agent_registration_certificate",
    label: "Recruiting Agent Registration Certificate (reference copy)",
    authority: "Protector General of Emigrants",
    is_required: false,
  },
];

/*
|--------------------------------------------------------------------------
| Initialize Checklist
|--------------------------------------------------------------------------
| Idempotent - if this job order already has checklist rows (e.g. legal-
| ization was started, reverted, and started again), does nothing.
|--------------------------------------------------------------------------
*/

export async function initializeLegalizationChecklist(jobOrderId: string) {
  const { data: existing, error: existingError } = await supabase
    .from("job_order_legalization_documents")
    .select("id")
    .eq("job_order_id", jobOrderId)
    .single();

  if (existing) {
    // Already seeded (e.g. legalization was started, reverted, restarted).
    return;
  }

  // PGRST116 = "no rows", which is the expected/normal case here - anything
  // else is a real failure and should say so.
  if (existingError && existingError.code !== "PGRST116") {
    throw new DatabaseError("Unable to check existing legalization checklist.", existingError);
  }

  const rows = DEFAULT_CHECKLIST.map((item) => ({
    job_order_id: jobOrderId,
    document_type: item.document_type,
    label: item.label,
    authority: item.authority,
    is_required: item.is_required,
    status: "pending",
  }));

  const { error } = await supabase.from("job_order_legalization_documents").insert(rows);

  if (error) {
    throw new DatabaseError("Unable to initialize legalization checklist.", error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Checklist
|--------------------------------------------------------------------------
*/

export async function getLegalizationChecklist(
  jobOrderId: string,
): Promise<LegalizationDocument[]> {
  const { data, error } = await supabase
    .from("job_order_legalization_documents")
    .select("*")
    .eq("job_order_id", jobOrderId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new DatabaseError("Unable to fetch legalization checklist.", error);
  }

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| Update a Checklist Item
|--------------------------------------------------------------------------
*/

export async function updateLegalizationDocument(
  documentId: string,
  adminId: string,
  updates: UpdateLegalizationDocumentInput,
): Promise<LegalizationDocument> {
  const patch: Record<string, unknown> = {
    ...updates,
    updated_by: adminId,
    updated_at: new Date().toISOString(),
  };

  if (updates.status === "submitted") {
    patch.submitted_at = new Date().toISOString();
  }

  if (updates.status === "attested") {
    patch.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("job_order_legalization_documents")
    .update(patch)
    .eq("id", documentId)
    .select()
    .single();

  if (error || !data) {
    throw new NotFoundError("Legalization document not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Completion Check
|--------------------------------------------------------------------------
| Used by the "Approve for Recruitment" gate (next step) - every required
| document must be attested before an admin can move the job order past
| legalization.
|--------------------------------------------------------------------------
*/

export async function isLegalizationComplete(jobOrderId: string): Promise<boolean> {
  const checklist = await getLegalizationChecklist(jobOrderId);

  const required = checklist.filter((item) => item.is_required);

  if (required.length === 0) {
    // No checklist yet (e.g. legalization never started) - not complete.
    return false;
  }

  return required.every((item) => item.status === "attested");
}

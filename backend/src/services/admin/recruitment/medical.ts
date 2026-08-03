import { supabase } from "../../../config/supabase";
import { DatabaseError, NotFoundError } from "../../../utils/AppError";
import { recordStatusChange } from "./statusHistory";

interface MedicalFilters {
  page?: number;
  limit?: number;
  status?: string;
  employerId?: string;
  jobOrderId?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| Medical List
|--------------------------------------------------------------------------
*/

export async function getMedicals(filters: MedicalFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("medicals").select(
    `
      *,
      candidate:candidates(
        id,
        full_name:name,
        phone,
        email
      ),
      application:applications(
        id,
        internal_status
      )
      `,
    {
      count: "exact",
    },
  );

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  if (filters.jobOrderId) {
    query = query.eq("job_order_id", filters.jobOrderId);
  }

  query = query
    .order("appointment_date", {
      ascending: true,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch medical records.", error);
  }

  return {
    medicals: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

/*
|--------------------------------------------------------------------------
| Medical Details
|--------------------------------------------------------------------------
*/

export async function getMedical(medicalId: string) {
  const { data, error } = await supabase
    .from("medicals")
    .select(
      `
      *,
      candidate:candidates(*),
      application:applications(*)
    `,
    )
    .eq("id", medicalId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Medical record not found.");
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Schedule Medical
|--------------------------------------------------------------------------
*/

export async function scheduleMedical(
  applicationId: string,
  scheduledBy: string,
  payload: {
    candidate_id: string;
    employer_id: string;
    job_order_id: string;
    hospital_name: string;
    doctor_name?: string;
    appointment_date: string;
    remarks?: string;
  },
) {
  const { data, error } = await supabase
    .from("medicals")
    .insert({
      application_id: applicationId,

      scheduled_by: scheduledBy,

      ...payload,

      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to schedule medical.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "medical",
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  await recordStatusChange(applicationId, "medical", { changedBy: scheduledBy });

  return data;
}
/*
|--------------------------------------------------------------------------
| Medical Passed
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Medical Failed
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Mark Medical Unfit
|--------------------------------------------------------------------------
*/

export async function markMedicalUnfit(medicalId: string, adminId: string, remarks: string) {
  const { data, error } = await supabase
    .from("medicals")
    .update({
      status: "unfit",

      remarks,

      verified_by: adminId,

      verified_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", medicalId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to update medical.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "rejected",

      last_status_change: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "rejected", { changedBy: adminId, notes: remarks });

  return data;
}
/*
|--------------------------------------------------------------------------
| Mark Medical Fit
|--------------------------------------------------------------------------
*/

export async function markMedicalFit(
  medicalId: string,
  adminId: string,
  reportDocumentId?: string,
  expiryDate?: string,
) {
  const { data, error } = await supabase
    .from("medicals")
    .update({
      status: "fit",

      verified_by: adminId,

      verified_at: new Date().toISOString(),

      report_document_id: reportDocumentId,

      expiry_date: expiryDate,

      updated_at: new Date().toISOString(),
    })
    .eq("id", medicalId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to update medical.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "visa_processing",

      last_status_change: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "visa_processing", { changedBy: adminId });

  return data;
}
/*
|--------------------------------------------------------------------------
| Retest Required
|--------------------------------------------------------------------------
*/

export async function markMedicalRetest(medicalId: string, adminId: string, remarks: string) {
  const { data, error } = await supabase
    .from("medicals")
    .update({
      status: "retest_required",

      remarks,

      verified_by: adminId,

      verified_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", medicalId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update medical.", error);
  }

  return data;
}

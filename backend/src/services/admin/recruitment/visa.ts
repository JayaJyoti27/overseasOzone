import { supabase } from "../../../config/supabase";
import { DatabaseError, NotFoundError } from "../../../utils/AppError";
import { recordStatusChange } from "./statusHistory";

interface VisaFilters {
  page?: number;
  limit?: number;
  status?: string;
  employerId?: string;
  jobOrderId?: string;
}

/*
|--------------------------------------------------------------------------
| Visa List
|--------------------------------------------------------------------------
*/

export async function getVisas(filters: VisaFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("visas").select(
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
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch visas.", error);
  }

  return {
    visas: data ?? [],
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
| Visa Details
|--------------------------------------------------------------------------
*/

export async function getVisa(visaId: string) {
  const { data, error } = await supabase
    .from("visas")
    .select(
      `
      *,
      candidate:candidates(*),
      application:applications(*)
    `,
    )
    .eq("id", visaId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Visa not found.");
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Create Visa
|--------------------------------------------------------------------------
*/

export async function createVisa(
  applicationId: string,
  createdBy: string,
  payload: {
    passport_number: string;
    embassy_name: string;
  },
) {
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("candidate_id, employer_id, job_order_id")
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    throw new NotFoundError("Application not found.");
  }

  const { data, error } = await supabase
    .from("visas")
    .insert({
      application_id: applicationId,
      created_by: createdBy,
      candidate_id: application.candidate_id,
      employer_id: application.employer_id,
      job_order_id: application.job_order_id,
      passport_number: payload.passport_number,
      embassy_name: payload.embassy_name,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to create visa.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Submit Visa
|--------------------------------------------------------------------------
*/

export async function submitVisa(visaId: string, changedBy?: string) {
  const { data, error } = await supabase
    .from("visas")
    .update({
      status: "submitted",

      submission_date: new Date(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", visaId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to submit visa.", error);
  }
  await supabase
    .from("applications")
    .update({
      internal_status: "visa_submitted",
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "visa_submitted", { changedBy });

  return data;
}
/*
|--------------------------------------------------------------------------
| Visa Approved
|--------------------------------------------------------------------------
*/

export async function approveVisa(
  visaId: string,
  adminId: string,
  visaNumber: string,
  issueDate: string,
  expiryDate: string,
) {
  const { data, error } = await supabase
    .from("visas")
    .update({
      status: "approved",

      verified_by: adminId,

      visa_number: visaNumber,

      approval_date: new Date(),

      issue_date: issueDate,

      expiry_date: expiryDate,

      updated_at: new Date().toISOString(),
    })
    .eq("id", visaId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to approve visa.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "visa_approved",

      last_status_change: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "visa_approved", { changedBy: adminId });

  return data;
}
/*
|--------------------------------------------------------------------------
| Visa Issued
|--------------------------------------------------------------------------
*/

export async function issueVisa(visaId: string, changedBy?: string) {
  const { data, error } = await supabase
    .from("visas")
    .update({
      status: "issued",

      updated_at: new Date().toISOString(),
    })
    .eq("id", visaId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to issue visa.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "ticket_confirmed",

      last_status_change: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "ticket_confirmed", { changedBy });

  return data;
}
/*
|--------------------------------------------------------------------------
| Reject Visa
|--------------------------------------------------------------------------
*/

export async function rejectVisa(visaId: string, remarks: string, changedBy?: string) {
  const { data, error } = await supabase
    .from("visas")
    .update({
      status: "rejected",

      remarks,

      updated_at: new Date().toISOString(),
    })
    .eq("id", visaId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to reject visa.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "rejected",

      last_status_change: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "rejected", { changedBy, notes: remarks });

  return data;
}

import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";
import { createNotification } from "./notifications";

interface EmployerFilters {
  page?: number;
  limit?: number;
  status?: string;
  approvalStatus?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| Employer List
|--------------------------------------------------------------------------
*/

export async function getEmployers(filters: EmployerFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("employers").select("*", {
    count: "exact",
  });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.approvalStatus) {
    query = query.eq("approval_status", filters.approvalStatus);
  }

  if (filters.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,
       contact_person.ilike.%${filters.search}%,
       email.ilike.%${filters.search}%`,
    );
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new DatabaseError("Unable to fetch employers.", error);

  return {
    employers: data ?? [],
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
| Employer Details
|--------------------------------------------------------------------------
*/

export async function getEmployer(employerId: string) {
  const { data, error } = await supabase
    .from("employers")
    .select("*")
    .eq("id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Employer not found.");
  }

  const { data: requirements } = await supabase
    .from("requirements")
    .select(
      `
        id,
        role,
        country,
        headcount,
        status,
        created_at
      `,
    )
    .eq("employer_id", employerId)
    .order("created_at", {
      ascending: false,
    });

  return {
    employer: data,
    requirements: requirements ?? [],
  };
}

/*
|--------------------------------------------------------------------------
| Employer Documents
|--------------------------------------------------------------------------
*/

export async function getEmployerDocuments(employerId: string) {
  const { data, error } = await supabase
    .from("employer_documents")
    .select(
      `
      id,
      document_type,
      name,
      file_url,
      status,
      expiry_date,
      uploaded_at,
      updated_at
    `,
    )
    .eq("employer_id", employerId)
    .order("uploaded_at", { ascending: false });

  if (error) throw new DatabaseError("Unable to fetch employer documents.", error);

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| Pending Employers
|--------------------------------------------------------------------------
*/

export async function getPendingEmployers() {
  const { data, error } = await supabase
    .from("employers")
    .select("*")
    .eq("approval_status", "pending")
    .order("created_at");

  if (error) throw new DatabaseError("Unable to fetch pending employers.", error);

  return data ?? [];
}
/*
|--------------------------------------------------------------------------
| Approve Employer
|--------------------------------------------------------------------------
*/

export async function approveEmployer(employerId: string, adminId: string) {
  const { data, error } = await supabase
    .from("employers")
    .update({
      approval_status: "approved",

      approved_by: adminId,

      approved_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to approve employer.", error);

  await createNotification({
    user_id: employerId,
    user_type: "employer",
    title: "You're approved!",
    message: `${data.company_name || "Your company"} has been approved. Complete your profile to start posting requirements.`,
    type: "employer_approved",
    related_entity: "employer",
    related_entity_id: employerId,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Suspend Employer
|--------------------------------------------------------------------------
*/

export async function suspendEmployer(employerId: string) {
  const { data, error } = await supabase
    .from("employers")
    .update({
      status: "inactive",

      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to suspend employer.", error);

  return data;
}

/*
|--------------------------------------------------------------------------
| Activate Employer
|--------------------------------------------------------------------------
*/

export async function activateEmployer(employerId: string) {
  const { data, error } = await supabase
    .from("employers")
    .update({
      status: "active",

      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to activate employer.", error);

  return data;
}

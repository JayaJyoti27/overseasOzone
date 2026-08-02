import { supabase } from "../../config/supabase";
import { ConflictError, DatabaseError, NotFoundError } from "../../utils/AppError";

interface RequirementFilters {
  page?: number;
  limit?: number;
  status?: string;
  employerId?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| Requirement List
|--------------------------------------------------------------------------
*/

export async function getRequirements(filters: RequirementFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("requirements").select(
    `
      *,
      employer:employers(
        id,
        company_name,
        contact_person,
        email,
        country
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

  if (filters.search) {
    query = query.or(
      `
      company_name.ilike.%${filters.search}%,
      role.ilike.%${filters.search}%,
      country.ilike.%${filters.search}%
      `,
    );
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch requirements.", error);
  }

  return {
    requirements: data ?? [],
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
| Requirement Details
|--------------------------------------------------------------------------
*/

export async function getRequirement(requirementId: string) {
  const { data, error } = await supabase
    .from("requirements")
    .select(
      `
      *,
      employer:employers(*)
    `,
    )
    .eq("id", requirementId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Requirement not found.");
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Start Review
|--------------------------------------------------------------------------
*/

export async function reviewRequirement(requirementId: string, adminId: string) {
  const { data, error } = await supabase
    .from("requirements")
    .update({
      status: "under_review",

      reviewed_by: adminId,

      reviewed_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", requirementId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to review requirement.", error);

  return data;
}

/*
|--------------------------------------------------------------------------
| Clarification
|--------------------------------------------------------------------------
*/

export async function requestClarification(requirementId: string, adminId: string, notes: string) {
  const { data, error } = await supabase
    .from("requirements")
    .update({
      status: "clarification_required",

      clarification_notes: notes,

      reviewed_by: adminId,

      reviewed_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", requirementId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to request clarification.", error);

  return data;
}

/*
|--------------------------------------------------------------------------
| Reject
|--------------------------------------------------------------------------
*/

export async function rejectRequirement(requirementId: string, adminId: string, reason: string) {
  const { data, error } = await supabase
    .from("requirements")
    .update({
      status: "rejected",

      rejection_reason: reason,

      reviewed_by: adminId,

      reviewed_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", requirementId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to reject requirement.", error);

  return data;
}

/*
|--------------------------------------------------------------------------
| Approve
|--------------------------------------------------------------------------
*/

export async function approveRequirement(requirementId: string, adminId: string) {
  const { data, error } = await supabase
    .from("requirements")
    .update({
      status: "approved",

      reviewed_by: adminId,

      reviewed_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", requirementId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to approve requirement.", error);

  return data;
}
/*
|--------------------------------------------------------------------------
| Convert Requirement → Job Order
|--------------------------------------------------------------------------
*/

export async function convertRequirementToJobOrder(requirementId: string, adminId: string) {
  /*
  |--------------------------------------------------------------------------
  | Load Requirement
  |--------------------------------------------------------------------------
  */

  const { data: requirement, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", requirementId)
    .single();

  if (error || !requirement) {
    throw new NotFoundError("Requirement not found.");
  }

  if (requirement.status === "rejected") {
    throw new ConflictError("A rejected requirement cannot be converted.");
  }

  if (requirement.converted_job_order_id) {
    throw new ConflictError("Requirement has already been converted.");
  }

  /*
  |--------------------------------------------------------------------------
  | Create Job Order
  |--------------------------------------------------------------------------
  */

  const { data: jobOrder, error: createError } = await supabase
    .from("job_orders")
    .insert({
      employer_id: requirement.employer_id,

      requirement_id: requirement.id,

      title: requirement.role,

      category: requirement.sector,

      country: requirement.country,

      vacancies: requirement.headcount,

      salary_min: requirement.salary_min ?? null,

      salary_max: requirement.salary_max ?? null,

      currency: requirement.currency ?? null,

      contract_duration: requirement.contract_duration ?? null,

      working_hours: requirement.working_hours ?? null,

      accommodation: requirement.accommodation ?? false,

      transport: requirement.transport ?? false,

      food: requirement.food ?? false,

      job_description: requirement.job_description ?? null,

      requirements: requirement.qualifications ?? null,

      benefits: requirement.benefits ?? null,

      status: "requirement_submitted",

      is_deleted: false,
    })
    .select()
    .single();

  if (createError || !jobOrder) {
    throw new DatabaseError("Unable to create job order.", createError);
  }

  /*
  |--------------------------------------------------------------------------
  | Update Requirement
  |--------------------------------------------------------------------------
  */

  await supabase
    .from("requirements")
    .update({
      status: "converted",

      converted_job_order_id: jobOrder.id,

      updated_at: new Date().toISOString(),
    })
    .eq("id", requirement.id);

  /*
  |--------------------------------------------------------------------------
  | Activity Log
  |--------------------------------------------------------------------------
  */

  await supabase.from("activity_logs").insert({
    user_id: adminId,

    action: "Requirement Converted",

    entity: "requirement",

    entity_id: requirement.id,
  });

  return {
    requirementId: requirement.id,

    jobOrder,
  };
}

import { supabase } from "../../config/supabase";
import { ConflictError, DatabaseError, NotFoundError } from "../../utils/AppError";

/*
|--------------------------------------------------------------------------
| Employer Requirements
|--------------------------------------------------------------------------
*/

interface RequirementFilters {
  employerId: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| List Requirements
|--------------------------------------------------------------------------
*/

export async function getEmployerRequirements(filters: RequirementFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  let query = supabase
    .from("requirements")
    .select("*", {
      count: "exact",
    })
    .eq("employer_id", filters.employerId);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(
      `role.ilike.%${filters.search}%,country.ilike.%${filters.search}%,sector.ilike.%${filters.search}%`,
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

export async function getEmployerRequirement(employerId: string, requirementId: string) {
  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", requirementId)
    .eq("employer_id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Requirement not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Create Requirement
|--------------------------------------------------------------------------
*/

export async function createRequirement(
  employerId: string,
  payload: {
    company_name: string;
    role: string;
    country: string;
    sector: string;
    headcount: number;
    timeline: string;
    message?: string;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    contract_duration?: string;
    working_hours?: string;
    accommodation?: boolean;
    transport?: boolean;
    food?: boolean;
    job_description?: string;
    qualifications?: string;
    benefits?: string;
  },
) {
  const { data, error } = await supabase
    .from("requirements")
    .insert({
      employer_id: employerId,

      company_name: payload.company_name,

      role: payload.role,

      country: payload.country,

      sector: payload.sector,

      headcount: payload.headcount,

      timeline: payload.timeline,

      message: payload.message ?? null,

      contact_person: payload.contact_person ?? null,

      contact_email: payload.contact_email ?? null,

      contact_phone: payload.contact_phone ?? null,

      salary_min: payload.salary_min ?? null,

      salary_max: payload.salary_max ?? null,

      currency: payload.currency ?? null,

      contract_duration: payload.contract_duration ?? null,

      working_hours: payload.working_hours ?? null,

      accommodation: payload.accommodation ?? false,

      transport: payload.transport ?? false,

      food: payload.food ?? false,

      job_description: payload.job_description ?? null,

      qualifications: payload.qualifications ?? null,

      benefits: payload.benefits ?? null,

      status: "submitted",
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to submit requirement.", error);
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,

    action: "Requirement Submitted",

    entity: "requirement",

    entity_id: data.id,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Update Requirement
|--------------------------------------------------------------------------
| Only allowed when clarification requested
|--------------------------------------------------------------------------
*/

export async function updateRequirement(
  employerId: string,
  requirementId: string,
  payload: Partial<{
    role: string;
    country: string;
    sector: string;
    headcount: number;
    timeline: string;
    message: string;
    contact_person: string;
    contact_email: string;
    contact_phone: string;
    salary_min: number;
    salary_max: number;
    currency: string;
    contract_duration: string;
    working_hours: string;
    accommodation: boolean;
    transport: boolean;
    food: boolean;
    job_description: string;
    qualifications: string;
    benefits: string;
  }>,
) {
  const { data: requirement } = await supabase
    .from("requirements")
    .select("status")
    .eq("id", requirementId)
    .eq("employer_id", employerId)
    .single();

  if (!requirement) {
    throw new NotFoundError("Requirement not found.");
  }

  if (requirement.status !== "clarification_required") {
    throw new ConflictError("Requirement cannot be edited.");
  }

  const { data, error } = await supabase
    .from("requirements")
    .update({
      ...payload,

      status: "submitted",
    })
    .eq("id", requirementId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update requirement.", error);
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,

    action: "Requirement Updated",

    entity: "requirement",

    entity_id: requirementId,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Withdraw Requirement
|--------------------------------------------------------------------------
| Allowed only before approval
|--------------------------------------------------------------------------
*/

export async function withdrawRequirement(employerId: string, requirementId: string) {
  const { data: requirement } = await supabase
    .from("requirements")
    .select("status")
    .eq("id", requirementId)
    .eq("employer_id", employerId)
    .single();

  if (!requirement) {
    throw new NotFoundError("Requirement not found.");
  }

  if (["approved", "converted"].includes(requirement.status)) {
    throw new ConflictError("Approved requirements cannot be withdrawn.");
  }

  const { data, error } = await supabase
    .from("requirements")
    .update({
      status: "withdrawn",
    })
    .eq("id", requirementId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to withdraw requirement.", error);
  }

  return data;
}

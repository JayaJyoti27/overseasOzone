import { supabase } from "../../config/supabase";
import { ConflictError, DatabaseError, NotFoundError } from "../../utils/AppError";

/*
|--------------------------------------------------------------------------
| Employer Job Orders
|--------------------------------------------------------------------------
*/

interface EmployerJobOrderFilters {
  employerId: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function getEmployerJobOrders(filters: EmployerJobOrderFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  let query = supabase
    .from("job_orders")
    .select(
      `
      *,
      applications(id)
      `,
      {
        count: "exact",
      },
    )
    .eq("employer_id", filters.employerId)
    .eq("is_deleted", false);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,country.ilike.%${filters.search}%`);
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch job orders.", error);
  }

  return {
    jobOrders:
      data?.map((job: any) => ({
        ...job,

        applicationCount: job.applications?.length ?? 0,
      })) ?? [],

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
| Job Order Details
|--------------------------------------------------------------------------
*/

export async function getEmployerJobOrder(employerId: string, jobOrderId: string) {
  const { data, error } = await supabase
    .from("job_orders")
    .select(
      `
        *,

        applications(
          id,
          status,
          internal_status,

          candidate:candidates(
            id,
            full_name:name,
            email
          )
        )
      `,
    )
    .eq("id", jobOrderId)
    .eq("employer_id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Job order not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Submit Job Order
|--------------------------------------------------------------------------
*/

export async function submitJobOrder(employerId: string, payload: any) {
  const { data, error } = await supabase
    .from("job_orders")
    .insert({
      ...payload,

      employer_id: employerId,

      status: "requirement_submitted",
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to submit job order.", error);
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,

    action: "Job Order Submitted",

    entity: "job_order",

    entity_id: data.id,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Employer Edit
|--------------------------------------------------------------------------
| Allowed ONLY when clarification is requested.
|--------------------------------------------------------------------------
*/

export async function updateEmployerJobOrder(employerId: string, jobOrderId: string, payload: any) {
  const { data: job } = await supabase
    .from("job_orders")
    .select("status")
    .eq("id", jobOrderId)
    .eq("employer_id", employerId)
    .single();

  if (!job) {
    throw new NotFoundError("Job order not found.");
  }

  if (job.status !== "clarification_required") {
    throw new ConflictError("This job order cannot be edited in its current status.");
  }

  const { data, error } = await supabase
    .from("job_orders")
    .update({
      ...payload,

      updated_at: new Date().toISOString(),
    })
    .eq("id", jobOrderId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update job order.", error);
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,

    action: "Job Order Updated",

    entity: "job_order",

    entity_id: jobOrderId,
  });

  return data;
}

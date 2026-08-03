import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";

/*
|--------------------------------------------------------------------------
| Employer Deployments
|--------------------------------------------------------------------------
*/

interface EmployerDeploymentFilters {
  employerId: string;

  page?: number;

  limit?: number;

  status?: string;

  jobOrderId?: string;
}

export async function getEmployerDeployments(filters: EmployerDeploymentFilters) {
  const page = filters.page ?? 1;

  const limit = filters.limit ?? 20;

  let query = supabase
    .from("deployments")
    .select(
      `
      id,
      status,
      airline_name,
      flight_number,
      departure_time,
      arrival_time,
      created_at,

      application:applications(
        id,

        candidate:candidates(
          id,
          full_name:name,
          email,
          phone
        )
      ),

      job:job_orders(
        id,
        title,
        country
      )
      `,
      {
        count: "exact",
      },
    )
    .eq("employer_id", filters.employerId);

  if (filters.status) {
    query = query.eq("status", filters.status);
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
    throw new DatabaseError("Unable to fetch deployments.", error);
  }

  return {
    deployments: data ?? [],

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
| Deployment Details
|--------------------------------------------------------------------------
*/

export async function getEmployerDeployment(employerId: string, deploymentId: string) {
  const { data, error } = await supabase
    .from("deployments")
    .select(
      `
        *,

        application:applications(
          id,

          candidate:candidates(
            id,
            full_name:name,
            email,
            phone,
            nationality
          )
        ),

        job:job_orders(
          id,
          title,
          country
        ),

        visa:visas(
          id,
          visa_number,
          status
        ),
          medical:medical_checkups(
  id,
  status
)
      `,
    )
    .eq("id", deploymentId)
    .eq("employer_id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Deployment not found.");
  }

  /*
  |--------------------------------------------------------------------------
  | Timeline
  |--------------------------------------------------------------------------
  */

  const { data: history } = await supabase
    .from("deployment_history")
    .select(
      `
      id,
      action,
      old_status,
      new_status,
      remarks,
      created_at,
      performed_by,
      performer:users(
        id,
        full_name:name
      )
    `,
    )
    .eq("deployment_id", deploymentId)
    .order("created_at");

  return {
    deployment: data,

    timeline: history ?? [],
  };
}

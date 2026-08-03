import { supabase } from "../../config/supabase";
import { ConflictError, DatabaseError, NotFoundError } from "../../utils/AppError";

/*
|--------------------------------------------------------------------------
| Employer Interviews
|--------------------------------------------------------------------------
*/

interface EmployerInterviewFilters {
  employerId: string;

  page?: number;

  limit?: number;

  status?: string;

  jobOrderId?: string;
}

export async function getEmployerInterviews(filters: EmployerInterviewFilters) {
  const page = filters.page ?? 1;

  const limit = filters.limit ?? 20;

  let query = supabase
    .from("interviews")
    .select(
      `
      *,
      application:applications(
        id,

        candidate:candidates(
          id,
          full_name:name,
          email,
          phone
        ),

        job:job_orders(
          id,
          title,
          country
        )
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

  query = query.order("interview_date").range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch interviews.", error);
  }

  return {
    interviews: data ?? [],

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
| Interview Details
|--------------------------------------------------------------------------
*/

export async function getEmployerInterview(employerId: string, interviewId: string) {
  const { data, error } = await supabase
    .from("interviews")
    .select(
      `
        *,

        application:applications(
          *,

          candidate:candidates(*),

          job:job_orders(*)
        )
      `,
    )
    .eq("id", interviewId)
    .eq("employer_id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Interview not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Confirm Interview
|--------------------------------------------------------------------------
*/

export async function confirmInterview(employerId: string, interviewId: string) {
  const { data: interview } = await supabase
    .from("interviews")
    .select("id,status")
    .eq("id", interviewId)
    .eq("employer_id", employerId)
    .single();

  if (!interview) {
    throw new NotFoundError("Interview not found.");
  }

  if (interview.status !== "scheduled") {
    throw new ConflictError("Interview cannot be confirmed.");
  }

  const { data, error } = await supabase
    .from("interviews")
    .update({
      status: "confirmed",

      updated_at: new Date().toISOString(),
    })
    .eq("id", interviewId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to confirm interview.", error);
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,

    action: "Interview Confirmed",

    entity: "interview",

    entity_id: interviewId,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Request Reschedule
|--------------------------------------------------------------------------
*/

export async function requestInterviewReschedule(
  employerId: string,
  interviewId: string,
  remarks: string,
) {
  const { data, error } = await supabase
    .from("interviews")
    .update({
      status: "reschedule_requested",

      notes: remarks,

      updated_at: new Date().toISOString(),
    })
    .eq("id", interviewId)
    .eq("employer_id", employerId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to request interview reschedule.", error);
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,

    action: "Interview Reschedule Requested",

    entity: "interview",

    entity_id: interviewId,
  });

  return data;
}

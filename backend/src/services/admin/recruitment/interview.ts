import { supabase } from "../../../config/supabase";
import { DatabaseError, NotFoundError } from "../../../utils/AppError";
import { recordStatusChange } from "./statusHistory";

interface InterviewFilters {
  page?: number;
  limit?: number;
  status?: string;
  employerId?: string;
  recruiterId?: string;
  applicationId?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| List Interviews
|--------------------------------------------------------------------------
*/

export async function getInterviews(filters: InterviewFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("interviews").select(
    `
      *,
      application:applications(
        id,
        internal_status
      ),
      candidate:candidates(
        id,
        full_name:name,
        phone,
        email
      ),
      employer:employers(
        id,
        company_name
      ),
      job_order:job_orders(
        id,
        title,
        country
      )
      `,
    {
      count: "exact",
    },
  );

  if (filters.applicationId) {
    query = query.eq("application_id", filters.applicationId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  if (filters.search) {
    query = query.ilike("remarks", `%${filters.search}%`);
  }

  query = query
    .order("interview_date", {
      ascending: true,
    })
    .range((page - 1) * limit, page * limit - 1);

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

export async function getInterview(interviewId: string) {
  const { data, error } = await supabase
    .from("interviews")
    .select(
      `
      *,
      application:applications(*),
      candidate:candidates(*),
      employer:employers(*),
      job_order:job_orders(*)
    `,
    )
    .eq("id", interviewId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Interview not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Schedule Interview
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Schedule Interview
|--------------------------------------------------------------------------
*/

export async function scheduleInterview(
  applicationId: string,
  scheduledBy: string,
  payload: {
    job_order_id: string;
    interview_date: string;
    mode: string;
    meeting_link?: string;
    location?: string;
    interviewer_name?: string;
    interviewer_email?: string;
    interviewer_phone?: string;
    notes?: string;
  },
) {
  const { data, error } = await supabase
    .from("interviews")
    .insert({
      application_id: applicationId,

      scheduled_by: scheduledBy,

      job_order_id: payload.job_order_id,

      interview_date: payload.interview_date,

      mode: payload.mode,

      meeting_link: payload.meeting_link,

      location: payload.location,

      interviewer_name: payload.interviewer_name,

      interviewer_email: payload.interviewer_email,

      interviewer_phone: payload.interviewer_phone,

      notes: payload.notes,

      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to schedule interview.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "interview_scheduled",
      last_status_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  await recordStatusChange(applicationId, "interview_scheduled", { changedBy: scheduledBy });

  return data;
}

/*
|--------------------------------------------------------------------------
| Complete Interview
|--------------------------------------------------------------------------
*/

export async function completeInterview(
  interviewId: string,
  result: "selected" | "rejected",
  feedback?: string,
  changedBy?: string,
) {
  const { data: interview, error } = await supabase
    .from("interviews")
    .update({
      status: "completed",

      result,

      feedback,

      completed_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", interviewId)
    .select()
    .single();

  if (error || !interview) {
    throw new DatabaseError("Unable to complete interview.", error);
  }

  const newStatus = result === "selected" ? "selected" : "rejected";

  await supabase
    .from("applications")
    .update({
      internal_status: newStatus,

      last_status_change: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", interview.application_id);

  await recordStatusChange(interview.application_id, newStatus, { changedBy, notes: feedback });

  return interview;
}
/*
|--------------------------------------------------------------------------
| Cancel Interview
|--------------------------------------------------------------------------
*/

export async function cancelInterview(interviewId: string, reason: string) {
  const { data, error } = await supabase
    .from("interviews")
    .update({
      status: "cancelled",

      cancelled_reason: reason,

      updated_at: new Date().toISOString(),
    })
    .eq("id", interviewId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to cancel interview.", error);
  }

  return data;
}

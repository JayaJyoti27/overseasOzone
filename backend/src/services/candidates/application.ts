import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";
import { CANDIDATE_VISIBLE_STATUSES } from "../../constants/applicationStatus";

interface ApplicationFilters {
  page?: number;
  limit?: number;
  status?: string;
}

/*
|--------------------------------------------------------------------------
| My Applications
|--------------------------------------------------------------------------
*/

export async function getCandidateApplications(candidateId: string, filters: ApplicationFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase
    .from("applications")
    .select(
      `
      *,
      jobs(*)
      `,
      {
        count: "exact",
      },
    )
    .eq("candidate_id", candidateId);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  query = query
    .order("applied_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch applications.", error);
  }

  return {
    applications: data ?? [],
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
| Application Details
|--------------------------------------------------------------------------
*/

export async function getCandidateApplication(candidateId: string, applicationId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      jobs(*),
      employers(*)
      `,
    )
    .eq("candidate_id", candidateId)
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Application not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Apply For Job
|--------------------------------------------------------------------------
*/

export async function applyForJob(candidateId: string, jobId: string) {
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing) {
    throw new DatabaseError("Already applied for this job.");
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("employer_id,job_order_id")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new NotFoundError("Job not found.");
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidateId,
      job_id: jobId,
      employer_id: job.employer_id,
      job_order_id: job.job_order_id,
      status: "application_received",
      applied_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to submit application.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Withdraw Application
|--------------------------------------------------------------------------
*/

export async function withdrawApplication(candidateId: string, applicationId: string) {
  const { data, error } = await supabase
    .from("applications")
    .update({
      status: "withdrawn",
      updated_at: new Date().toISOString(),
    })
    .eq("candidate_id", candidateId)
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to withdraw application.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Application Timeline
|--------------------------------------------------------------------------
*/

export async function getApplicationTimeline(candidateId: string, applicationId: string) {
  const { data, error } = await supabase
    .from("application_status_history")
    .select("*")
    .eq("application_id", applicationId)
    .in("status", CANDIDATE_VISIBLE_STATUSES)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new DatabaseError("Unable to fetch timeline.", error);
  }

  return data ?? [];
}

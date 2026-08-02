import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";
import { attachCompanyNames, getJobOrderDetails } from "./jobs";

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
      job:jobs(*)
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

  // List view just needs company for display, not the full job_order
  // detail breakdown (that's only fetched on the single-application page).
  const jobs = await attachCompanyNames((data ?? []).map((a) => a.job).filter(Boolean));
  const jobById = new Map(jobs.map((j) => [j.id, j]));

  return {
    applications: (data ?? []).map((a) => ({
      ...a,
      job: a.job ? (jobById.get(a.job.id) ?? a.job) : null,
    })),
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
      job:jobs(*),
      employers(*)
      `,
    )
    .eq("candidate_id", candidateId)
    .eq("id", applicationId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Application not found.");
  }

  // The plain jobs(*) embed doesn't carry company/contact info (jobs has
  // no such columns) or the employer's original job_order detail fields
  // (working hours, accommodation/transport/food, benefits,
  // qualifications) - same enrichment as the standalone job detail page,
  // so an applied job's full info matches what the candidate saw when
  // they applied.
  const [enrichedJob] = data.job ? await attachCompanyNames([data.job]) : [null];
  const jobOrder = data.job ? await getJobOrderDetails(data.job.job_order_id) : null;

  return {
    ...data,
    job: enrichedJob ? { ...enrichedJob, job_order: jobOrder } : null,
  };
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
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new DatabaseError("Unable to fetch timeline.", error);
  }

  return data ?? [];
}

import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";

interface JobFilters {
  page?: number;
  limit?: number;
  country?: string;
  category?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| Attach Employer Company Name
|--------------------------------------------------------------------------
| The `jobs` table has no company column - the employer is only reachable
| by going jobs.job_order_id -> job_orders.employer_id -> employers.
| company_name. Done as a manual two-step join (same pattern as the
| applications/saved_jobs lookups below) rather than a nested PostgREST
| embed, since job_order_id isn't a declared FK relationship PostgREST
| can traverse automatically.
|--------------------------------------------------------------------------
*/

async function attachCompanyNames<T extends { job_order_id?: string | null }>(
  jobs: T[],
): Promise<(T & { company: string | null; contact_email: string | null; contact_phone: string | null })[]> {
  const jobOrderIds = [...new Set(jobs.map((j) => j.job_order_id).filter(Boolean))] as string[];

  if (!jobOrderIds.length) {
    return jobs.map((job) => ({ ...job, company: null, contact_email: null, contact_phone: null }));
  }

  const { data: jobOrders } = await supabase
    .from("job_orders")
    .select("id, employer_id")
    .in("id", jobOrderIds);

  const employerIdByJobOrderId = new Map(
    (jobOrders ?? []).map((jo) => [jo.id, jo.employer_id]),
  );

  const employerIds = [...new Set([...employerIdByJobOrderId.values()].filter(Boolean))];

  const { data: employers } = employerIds.length
    ? await supabase.from("employers").select("id, company_name, email, phone").in("id", employerIds)
    : { data: [] };

  const employerById = new Map((employers ?? []).map((e) => [e.id, e]));

  return jobs.map((job) => {
    const employerId = job.job_order_id ? employerIdByJobOrderId.get(job.job_order_id) : undefined;
    const employer = employerId ? employerById.get(employerId) : undefined;

    return {
      ...job,
      company: employer?.company_name ?? null,
      contact_email: employer?.email ?? null,
      contact_phone: employer?.phone ?? null,
    };
  });
}

/*
|--------------------------------------------------------------------------
| Browse Jobs
|--------------------------------------------------------------------------
*/

export async function getCandidateJobs(candidateId: string, filters: JobFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase
    .from("jobs")
    .select("*", {
      count: "exact",
    })
    .eq("status", "active");

  if (filters.country) {
    query = query.eq("country", filters.country);
  }

  if (filters.category) {
    query = query.eq("sector", filters.category);
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
    throw new DatabaseError("Unable to fetch jobs.", error);
  }

  const jobIds = data?.map((job) => job.id) ?? [];

  const { data: applications } = await supabase
    .from("applications")
    .select("job_id")
    .eq("candidate_id", candidateId)
    .in("job_id", jobIds);

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("candidate_id", candidateId)
    .in("job_id", jobIds);

  const withCompany = await attachCompanyNames(data ?? []);

  return {
    jobs: withCompany.map((job) => ({
      ...job,
      applied: applications?.some((a) => a.job_id === job.id) ?? false,
      saved: savedJobs?.some((s) => s.job_id === job.id) ?? false,
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
| Job Details
|--------------------------------------------------------------------------
*/

export async function getCandidateJob(candidateId: string, jobId: string) {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();

  if (error || !data) {
    throw new NotFoundError("Job not found.");
  }

  const [withCompany] = await attachCompanyNames([data]);

  const { data: application } = await supabase
    .from("applications")
    .select("id,status")
    .eq("candidate_id", candidateId)
    .eq("job_id", jobId)
    .maybeSingle();

  const { data: saved } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("job_id", jobId)
    .maybeSingle();

  return {
    ...withCompany,
    applied: !!application,
    application,
    saved: !!saved,
  };
}

/*
|--------------------------------------------------------------------------
| Save Job
|--------------------------------------------------------------------------
*/

export async function saveJob(candidateId: string, jobId: string) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .insert({
      candidate_id: candidateId,
      job_id: jobId,
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to save job.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Remove Saved Job
|--------------------------------------------------------------------------
*/

export async function removeSavedJob(candidateId: string, jobId: string) {
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("candidate_id", candidateId)
    .eq("job_id", jobId);

  if (error) {
    throw new DatabaseError("Unable to remove saved job.", error);
  }

  return {
    success: true,
  };
}
/*
|--------------------------------------------------------------------------
| Recommended Jobs
|--------------------------------------------------------------------------
*/

export async function getRecommendedJobs(candidateId: string, limit = 6) {
  const { data: candidate } = await supabase
    .from("candidates")
    .select("specialty, preferred_country, current_country, target_countries")
    .eq("id", candidateId)
    .single();

  let query = supabase.from("jobs").select("*").eq("status", "active");

  const countryMatches = [candidate?.preferred_country, candidate?.current_country].filter(Boolean);

  const orConditions: string[] = [];

  if (candidate?.specialty) {
    orConditions.push(`sector.eq.${candidate.specialty}`);
  }

  for (const country of countryMatches) {
    orConditions.push(`country.eq.${country}`);
  }

  if (candidate?.target_countries?.length) {
    orConditions.push(`country.in.(${candidate.target_countries.join(",")})`);
  }

  // If we have nothing to match on, just fall back to the newest active jobs
  // rather than returning nothing.
  if (orConditions.length) {
    query = query.or(orConditions.join(","));
  }

  query = query.order("created_at", { ascending: false }).limit(limit);

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch recommended jobs.", error);
  }

  const jobIds = data?.map((job) => job.id) ?? [];

  const { data: applications } = await supabase
    .from("applications")
    .select("job_id")
    .eq("candidate_id", candidateId)
    .in("job_id", jobIds);

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("candidate_id", candidateId)
    .in("job_id", jobIds);

  const withCompany = await attachCompanyNames(data ?? []);

  return withCompany
    .filter((job) => !applications?.some((a) => a.job_id === job.id))
    .map((job) => ({
      ...job,
      applied: false,
      saved: savedJobs?.some((s) => s.job_id === job.id) ?? false,
    }));
}

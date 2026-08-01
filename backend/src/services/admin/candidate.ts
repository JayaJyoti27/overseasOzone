import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";

interface CandidateFilters {
  page?: number;
  limit?: number;
  status?: string;
  country?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| Candidate List
|--------------------------------------------------------------------------
*/

export async function getCandidates(filters: CandidateFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("candidates").select("*", {
    count: "exact",
  });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.country) {
    query = query.eq("preferred_country", filters.country);
  }

  if (filters.search) {
    query = query.or(
      `
      name.ilike.%${filters.search}%,
      email.ilike.%${filters.search}%,
      phone.ilike.%${filters.search}%
      `,
    );
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new DatabaseError("Unable to fetch candidates.", error);

  return {
    candidates: data ?? [],

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
| Candidate Details
|--------------------------------------------------------------------------
*/

export async function getCandidate(candidateId: string) {
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (error || !candidate) {
    throw new NotFoundError("Candidate not found.");
  }

  // The `candidates` table's real column names (name, current_country,
  // passport_expiry) don't match what the admin frontend expects
  // (full_name, current_location, passport_expiry_date). Same translation
  // as services/candidates/profile.ts#toApiShape - keep both in sync.
  const { name, current_country, passport_expiry, ...restCandidate } = candidate;
  const apiCandidate = {
    ...restCandidate,
    full_name: name,
    current_location: current_country,
    passport_expiry_date: passport_expiry,
  };

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
        id,
        status,
        internal_status,
        created_at,

        job:job_orders(
          id,
          title,
          country
        )
      `,
    )
    .eq("candidate_id", candidateId)
    .order("created_at", {
      ascending: false,
    });

  const { data: documents } = await supabase
    .from("documents")
    .select(
      `
        id,
        document_type,
        file_name,
        original_file_name,
        public_url,
        status,
        verified_at,
        expires_at
      `,
    )
    .eq("candidate_id", candidateId)
    .order("created_at", {
      ascending: false,
    });

  return {
    candidate: apiCandidate,

    applications: applications ?? [],

    documents: documents ?? [],

    resume: documents?.find((d) => d.document_type === "resume") ?? null,
  };
}

/*
|--------------------------------------------------------------------------
| Activate Candidate
|--------------------------------------------------------------------------
*/

export async function activateCandidate(candidateId: string) {
  const { data, error } = await supabase
    .from("candidates")
    .update({
      status: "active",

      updated_at: new Date().toISOString(),
    })
    .eq("id", candidateId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to activate candidate.", error);

  return data;
}

/*
|--------------------------------------------------------------------------
| Suspend Candidate
|--------------------------------------------------------------------------
*/

export async function suspendCandidate(candidateId: string) {
  const { data, error } = await supabase
    .from("candidates")
    .update({
      status: "inactive",

      updated_at: new Date().toISOString(),
    })
    .eq("id", candidateId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to suspend candidate.", error);

  return data;
}

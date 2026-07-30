import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";

export async function getEmployerCandidate(employerId: string, candidateId: string) {
  const { data: applications, error: appError } = await supabase
    .from("applications")
    .select(
      `
      id, status, internal_status, created_at,
      job:job_orders!inner( id, title, country, employer_id )
    `,
    )
    .eq("candidate_id", candidateId)
    .eq("job.employer_id", employerId) // was DEMO_EMPLOYER_ID
    .order("created_at", { ascending: false });

  // ...rest of function unchanged;

  if (appError) throw new DatabaseError("Unable to fetch candidate applications.", appError);
  if (!applications || applications.length === 0) {
    throw new NotFoundError("Candidate not found."); // also covers "not this employer's candidate"
  }

  const { data: candidate, error: candError } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (candError || !candidate) throw new NotFoundError("Candidate not found.");

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
    .order("created_at", { ascending: false });

  return {
    candidate,
    applications,
    documents: documents ?? [],
    resume: documents?.find((d) => d.document_type === "resume") ?? null,
  };
}
/*
|--------------------------------------------------------------------------
| Candidate List (all candidates who applied to this employer's job orders)
|--------------------------------------------------------------------------
*/

export async function getEmployerCandidates(employerId: string) {
  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      `
        id,
        status,
        internal_status,
        created_at,
        candidate:candidates(
          id,
          full_name,
          email,
          phone,
          preferred_country
        ),
        job:job_orders!inner(
          id,
          title,
          employer_id
        )
      `,
    )
    .eq("job.employer_id", employerId)
    .order("created_at", { ascending: false });

  if (error) throw new DatabaseError("Unable to fetch candidates.", error);

  // One row per candidate — keep their most recent application only
  const seen = new Set<string>();
  const candidates: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    position: string;
    status: string;
    applied_at: string;
  }> = [];

  for (const app of applications ?? []) {
    const candidate = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
    const job = Array.isArray(app.job) ? app.job[0] : app.job;

    if (!candidate?.id || seen.has(candidate.id)) continue;
    seen.add(candidate.id);

    candidates.push({
      id: candidate.id,
      name: candidate.full_name ?? "—",
      email: candidate.email ?? "—",
      phone: candidate.phone ?? "—",
      country: candidate.preferred_country ?? "—",
      position: job?.title ?? "—",
      status: app.status ?? "—",
      applied_at: app.created_at,
    });
  }

  return candidates;
}

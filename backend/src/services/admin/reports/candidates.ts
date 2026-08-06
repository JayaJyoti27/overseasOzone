import { supabase } from "../../../config/supabase";
import { DatabaseError } from "../../../utils/AppError";

/*
|--------------------------------------------------------------------------
| Candidate Summary
|--------------------------------------------------------------------------
*/

export async function getCandidateSummary() {
  const [total, active, inactive, verified] = await Promise.all([
    supabase.from("candidates").select("*", { count: "exact", head: true }),

    supabase.from("candidates").select("*", { count: "exact", head: true }).eq("status", "active"),

    supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("status", "inactive"),

    // "verified" is a value of `status` here, not a separate boolean column —
    // there is no is_verified column on candidates. TODO: confirm this is the
    // right status value once the real status list is confirmed.
    supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("status", "verified"),
  ]);

  if (total.error || active.error || inactive.error || verified.error) {
    throw new DatabaseError(
      "Unable to fetch candidate summary.",
      total.error ?? active.error ?? inactive.error ?? verified.error,
    );
  }

  return {
    total: total.count ?? 0,
    active: active.count ?? 0,
    inactive: inactive.count ?? 0,
    verified: verified.count ?? 0,
  };
}
/*
|--------------------------------------------------------------------------
| Candidates by Country
|--------------------------------------------------------------------------
*/

export async function getCandidatesByCountry() {
  const { data, error } = await supabase.from("candidates").select("preferred_country");

  if (error) {
    throw new DatabaseError("Unable to fetch candidates by country.", error);
  }

  const countries: Record<string, number> = {};

  for (const row of data ?? []) {
    const country = row.preferred_country || "Unknown";

    countries[country] = (countries[country] ?? 0) + 1;
  }

  return countries;
}
/*
|--------------------------------------------------------------------------
| Candidates by Profession
|--------------------------------------------------------------------------
*/

export async function getCandidatesByProfession() {
  // `profession` is not a real column on candidates — verified against every
  // other candidate query in the codebase, it doesn't exist anywhere. The
  // closest real fields are `skills` (array) and `experience` (structured),
  // neither of which is a single "profession" string. Returning empty here
  // instead of throwing so this doesn't take down the whole report while a
  // real backing field gets decided on.
  return {} as Record<string, number>;
}
/*
|--------------------------------------------------------------------------
| Monthly Registrations
|--------------------------------------------------------------------------
*/

export async function getMonthlyRegistrations() {
  const { data, error } = await supabase.from("candidates").select("created_at");

  if (error) {
    throw new DatabaseError("Unable to fetch registrations.", error);
  }

  const monthly: Record<string, number> = {};

  for (const row of data ?? []) {
    const month = new Date(row.created_at).toISOString().slice(0, 7);

    monthly[month] = (monthly[month] ?? 0) + 1;
  }

  return monthly;
}
/*
|--------------------------------------------------------------------------
| Candidate Report
|--------------------------------------------------------------------------
*/

export async function getCandidateReport() {
  const [summary, countries, professions, monthly] = await Promise.all([
    getCandidateSummary(),
    getCandidatesByCountry(),
    getCandidatesByProfession(),
    getMonthlyRegistrations(),
  ]);

  return {
    summary,
    countries,
    professions,
    monthly,
  };
}

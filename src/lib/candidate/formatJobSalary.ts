import type { CandidateJob } from "./types";

/**
 * Jobs are stored as separate salary_min/salary_max columns, not a single
 * figure - this renders whatever combination is actually present rather
 * than assuming both are always set.
 */
export function formatJobSalary(job: Pick<CandidateJob, "salary_min" | "salary_max" | "currency">) {
  const { salary_min, salary_max, currency } = job;

  if (!salary_min && !salary_max) return null;

  const range =
    salary_min && salary_max && salary_min !== salary_max
      ? `${salary_min.toLocaleString()} - ${salary_max.toLocaleString()}`
      : (salary_min ?? salary_max)!.toLocaleString();

  return currency ? `${range} ${currency}` : range;
}

import { supabase } from "../../config/supabase";
import { NotFoundError } from "../../utils/AppError";

export async function getEmployerDashboard(employerId: string) {
  /*
  |--------------------------------------------------------------------------
  | Employer Profile
  |--------------------------------------------------------------------------
  */

  const { data: employer, error: employerError } = await supabase
    .from("employers")
    .select(
      `
        id,
        company_name,
        contact_person,
        logo_url,
        country,
        industry,
        approval_status,
        status
      `,
    )
    .eq("id", employerId)
    .single();

  if (employerError || !employer) {
    throw new NotFoundError("Employer not found.");
  }

  /*
  |--------------------------------------------------------------------------
  | Job Order Statistics
  |--------------------------------------------------------------------------
  */

  const [
    activeJobs,
    underReview,
    legalization,
    recruitmentOpen,
    interviews,
    shortlistedCandidates,
    selectedCandidates,
    deployedCandidates,
    candidateApplications,
  ] = await Promise.all([
    supabase
      .from("job_orders")
      .select("*", { head: true, count: "exact" })
      .eq("employer_id", employerId)
      .in("status", ["approved_for_recruitment", "recruitment_open"])
      .eq("is_deleted", false),

    supabase
      .from("job_orders")
      .select("*", { head: true, count: "exact" })
      .eq("employer_id", employerId)
      .in("status", ["under_admin_review", "clarification_required", "employer_approval_pending"])
      .eq("is_deleted", false),

    supabase
      .from("job_orders")
      .select("*", { head: true, count: "exact" })
      .eq("employer_id", employerId)
      .eq("status", "legalization_in_progress")
      .eq("is_deleted", false),

    supabase
      .from("job_orders")
      .select("*", { head: true, count: "exact" })
      .eq("employer_id", employerId)
      .eq("status", "recruitment_open")
      .eq("is_deleted", false),

    // FIX: interviews has no employer_id column — join through job_orders instead
    supabase
      .from("interviews")
      .select("*, job_orders!inner(employer_id)", { head: true, count: "exact" })
      .eq("job_orders.employer_id", employerId)
      .gte("interview_date", new Date().toISOString()),

    supabase
      .from("applications")
      .select("*", { head: true, count: "exact" })
      .eq("employer_id", employerId)
      .eq("internal_status", "employer_shortlisted"),

    supabase
      .from("applications")
      .select("*", { head: true, count: "exact" })
      .eq("employer_id", employerId)
      .eq("internal_status", "selected"),

    supabase
      .from("deployments")
      .select("*", { head: true, count: "exact" })
      .eq("employer_id", employerId)
      .eq("status", "deployed"),

    // NEW: total distinct candidates who have applied to this employer
    supabase.from("applications").select("candidate_id").eq("employer_id", employerId),
  ]);

  const totalCandidates = new Set((candidateApplications.data ?? []).map((row) => row.candidate_id))
    .size;

  /*
  |--------------------------------------------------------------------------
  | Recent Job Orders
  |--------------------------------------------------------------------------
  */

  const { data: recentJobs } = await supabase
    .from("job_orders")
    .select(
      `
        id,
        title,
        country,
        vacancies,
        status,
        created_at
      `,
    )
    .eq("employer_id", employerId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(5);

  /*
  |--------------------------------------------------------------------------
  | Upcoming Interviews
  |--------------------------------------------------------------------------
  */

  const { data: upcomingInterviews } = await supabase
    .from("interviews")
    .select(
      `
        id,
        interview_date,
        mode,
        job_orders!inner(employer_id, title),
        application:applications(
          id,
          candidate:candidates(
            id,
            name
          )
        )
      `,
    )
    .eq("job_orders.employer_id", employerId)
    .order("interview_date")
    .limit(5);

  /*
  |--------------------------------------------------------------------------
  | Dashboard Response
  |--------------------------------------------------------------------------
  */

  return {
    employer,

    dashboard: {
      activeJobOrders: activeJobs.count ?? 0,
      jobOrdersUnderReview: underReview.count ?? 0,
      legalizationInProgress: legalization.count ?? 0,
      jobsOpenForRecruitment: recruitmentOpen.count ?? 0,
      interviewsScheduled: interviews.count ?? 0,
      candidatesShortlisted: shortlistedCandidates.count ?? 0,
      candidatesSelected: selectedCandidates.count ?? 0,
      candidatesDeployed: deployedCandidates.count ?? 0,
      totalCandidates,
    },

    recentJobOrders: recentJobs ?? [],

    upcomingInterviews: upcomingInterviews ?? [],
  };
}

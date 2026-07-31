import { supabase } from "../../config/supabase";

/*
|--------------------------------------------------------------------------
| Admin Dashboard - Quick Statistics
|--------------------------------------------------------------------------
| Note: "new" registrations are counted over a trailing 7-day window.
| "Pending" reviews assume a status: 'pending' default on new candidate
| rows and approval_status: 'pending' on new employer rows - adjust the
| .eq(...) filters below if your schema uses different default values.
*/

const SEVEN_DAYS_AGO = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export async function getAdminDashboard() {
  const sevenDaysAgo = SEVEN_DAYS_AGO();

  const [
    totalCandidates,
    newCandidateRegistrations,
    pendingCandidateReviews,
    totalEmployers,
    activeEmployers,
    pendingEmployerReviews,
    totalRequirements,
    pendingRequirementsCount,
    activeJobOrders,
    applicationsReceived,
    deployedCandidates,
  ] = await Promise.all([
    supabase.from("candidates").select("*", { head: true, count: "exact" }),

    supabase
      .from("candidates")
      .select("*", { head: true, count: "exact" })
      .gte("created_at", sevenDaysAgo),

    supabase.from("candidates").select("*", { head: true, count: "exact" }).eq("status", "pending"),

    supabase.from("employers").select("*", { head: true, count: "exact" }),

    supabase.from("employers").select("*", { head: true, count: "exact" }).eq("status", "active"),

    supabase
      .from("employers")
      .select("*", { head: true, count: "exact" })
      .eq("approval_status", "pending"),

    supabase.from("requirements").select("*", { head: true, count: "exact" }),

    supabase
      .from("requirements")
      .select("*", { head: true, count: "exact" })
      .in("status", ["submitted", "under_review"]),

    supabase
      .from("job_orders")
      .select("*", { head: true, count: "exact" })
      .eq("status", "recruitment_open"),

    supabase.from("applications").select("*", { head: true, count: "exact" }),

    supabase
      .from("deployments")
      .select("*", { head: true, count: "exact" })
      .eq("status", "deployed"),
  ]);

  const { data: recentEmployers } = await supabase
    .from("employers")
    .select(
      `
        id,
        company_name,
        contact_person,
        email,
        country,
        approval_status,
        created_at
      `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingEmployers } = await supabase
    .from("employers")
    .select(
      `
        id,
        company_name,
        contact_person,
        email,
        country,
        approval_status,
        created_at
      `,
    )
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentRequirements } = await supabase
    .from("requirements")
    .select(
      `
        id,
        company_name,
        role,
        country,
        headcount,
        status,
        created_at
      `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingRequirements } = await supabase
    .from("requirements")
    .select(
      `
        id,
        company_name,
        role,
        country,
        headcount,
        status,
        created_at
      `,
    )
    .in("status", ["submitted", "under_review"])
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    statistics: {
      totalCandidates: totalCandidates.count ?? 0,
      newCandidateRegistrations: newCandidateRegistrations.count ?? 0,
      pendingCandidateReviews: pendingCandidateReviews.count ?? 0,

      totalEmployers: totalEmployers.count ?? 0,
      activeEmployers: activeEmployers.count ?? 0,
      pendingEmployerReviews: pendingEmployerReviews.count ?? 0,

      totalRequirements: totalRequirements.count ?? 0,
      pendingRequirements: pendingRequirementsCount.count ?? 0,

      activeJobOrders: activeJobOrders.count ?? 0,
      applicationsReceived: applicationsReceived.count ?? 0,
      deployedCandidates: deployedCandidates.count ?? 0,
    },

    recentEmployers: recentEmployers ?? [],
    pendingEmployers: pendingEmployers ?? [],
    recentRequirements: recentRequirements ?? [],
    pendingRequirements: pendingRequirements ?? [],
  };
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Users, UserCheck, CalendarDays, Plane, AlertCircle, Sparkles } from "lucide-react";

import { StatCard } from "@/components/Employer/Dashboard/StatCard";
import { QuickActions } from "@/components/Employer/Dashboard/QuickActions";
import { RecentJobOrders } from "@/components/Employer/Dashboard/RecentJobOrders";
import { UpcomingInterviews } from "@/components/Employer/Dashboard/UpcomingInterviews";

import { Button } from "@/components/ui/button";

import { getDashboard } from "@/lib/employer/api";

export const Route = createFileRoute("/Employer/dashboard")({
  component: EmployerDashboard,
});

function EmployerDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load employer dashboard:", err);
      setError("Couldn't load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stats = dashboard?.dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {dashboard?.employer?.company_name ? `Welcome back, ${dashboard.employer.company_name}` : "Employer Dashboard"}
          </h1>

          <p className="text-muted-foreground">
            Here's an overview of your recruitment activity.
          </p>
        </div>

        <Button asChild>
          <Link to="/Employer/job-orders/new">Create Job Order</Link>
        </Button>
      </div>

      {!loading && !error && dashboard?.employer && !dashboard.employer.industry && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-600" size={18} />
            <p className="text-sm text-amber-800">
              You're approved! Add your industry, HR contact, and branches to finish setting up your
              company profile.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/Employer/company">Complete Profile</Link>
          </Button>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[104px] animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertCircle className="text-red-500" size={32} />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={load}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards - each links to the page that explains the number */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Active Job Orders"
              value={stats?.activeJobOrders ?? 0}
              icon={Briefcase}
              color="blue"
              href="/Employer/job-orders"
            />

            <StatCard
              title="Candidates"
              value={stats?.totalCandidates ?? 0}
              icon={Users}
              color="green"
              href="/Employer/candidates"
            />

            <StatCard
              title="Shortlisted"
              value={stats?.candidatesShortlisted ?? 0}
              icon={UserCheck}
              color="amber"
              href="/Employer/candidates"
            />

            <StatCard
              title="Interviews"
              value={stats?.interviewsScheduled ?? 0}
              icon={CalendarDays}
              color="amber"
              href="/Employer/interviews"
            />

            <StatCard
              title="Deployments"
              value={stats?.candidatesDeployed ?? 0}
              icon={Plane}
              color="purple"
              href="/Employer/deployment"
            />
          </section>

          {stats && (stats.jobOrdersUnderReview > 0 || stats.legalizationInProgress > 0) && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-wash/60 px-4 py-3 text-sm text-navy">
              <AlertCircle className="h-4 w-4 shrink-0 text-blue" />
              {stats.jobOrdersUnderReview > 0 && (
                <span>
                  {stats.jobOrdersUnderReview} job order{stats.jobOrdersUnderReview > 1 ? "s" : ""}{" "}
                  awaiting admin review.
                </span>
              )}
              {stats.legalizationInProgress > 0 && (
                <span>
                  {stats.legalizationInProgress} in legalization — action may be needed on your
                  side.
                </span>
              )}
              <Link to="/Employer/job-orders" className="ml-auto font-medium text-blue hover:underline">
                Review now
              </Link>
            </div>
          )}

          {/* Bottom Section */}
          <section className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <RecentJobOrders />
            </div>

            <div className="space-y-6 xl:col-span-5">
              <QuickActions />
              <UpcomingInterviews interviews={dashboard?.upcomingInterviews ?? []} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

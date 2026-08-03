import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  UserCheck,
  CalendarDays,
  Plane,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { StatCard } from "@/components/Employer/Dashboard/StatCard";
import { RecruitmentPipeline } from "@/components/Employer/Dashboard/RecruitmentPipeline";
import { QuickActions } from "@/components/Employer/Dashboard/QuickActions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getDashboard } from "@/lib/employer/api";

export const Route = createFileRoute("/Employer/dashboard")({
  component: EmployerDashboard,
});

const STAT_CONFIG = {
  activeJobOrders: { title: "Active Job Orders", icon: Briefcase, color: "blue" },
  totalCandidates: { title: "Candidates", icon: Users, color: "green" },
  candidatesShortlisted: { title: "Shortlisted", icon: UserCheck, color: "amber" },
  upcomingInterviews: { title: "Interviews", icon: CalendarDays, color: "amber" },
  deployments: { title: "Deployments", icon: Plane, color: "purple" },
} as const;

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
      console.log("DASHBOARD API RESPONSE:", JSON.stringify(data, null, 2));
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load employer dashboard:", err);
      setError("Couldn't load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>

          <p className="text-muted-foreground">
            Welcome back. Here's an overview of your recruitment activities.
          </p>

          {dashboard?.employer && (
            <p className="mt-2 text-sm text-muted-foreground">
              Logged in as {dashboard.employer.company_name}
            </p>
          )}
        </div>

        <Button>Create Job Order</Button>
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

      {loading && <p>Loading dashboard...</p>}

      {error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertCircle className="text-red-500" size={32} />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={load}>Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title={STAT_CONFIG.activeJobOrders.title}
              value={dashboard?.dashboard?.activeJobOrders ?? 0}
              icon={STAT_CONFIG.activeJobOrders.icon}
              color={STAT_CONFIG.activeJobOrders.color}
            />

            <StatCard
              title={STAT_CONFIG.totalCandidates.title}
              value={dashboard?.dashboard?.totalCandidates ?? 0}
              icon={STAT_CONFIG.totalCandidates.icon}
              color={STAT_CONFIG.totalCandidates.color}
            />

            <StatCard
              title={STAT_CONFIG.candidatesShortlisted.title}
              value={dashboard?.dashboard?.candidatesShortlisted ?? 0}
              icon={STAT_CONFIG.candidatesShortlisted.icon}
              color={STAT_CONFIG.candidatesShortlisted.color}
            />

            <StatCard
              title={STAT_CONFIG.upcomingInterviews.title}
              value={dashboard?.dashboard?.interviewsScheduled ?? 0}
              icon={STAT_CONFIG.upcomingInterviews.icon}
              color={STAT_CONFIG.upcomingInterviews.color}
            />

            <StatCard
              title={STAT_CONFIG.deployments.title}
              value={dashboard?.dashboard?.candidatesDeployed ?? 0}
              icon={STAT_CONFIG.deployments.icon}
              color={STAT_CONFIG.deployments.color}
            />
          </section>

          {/* Bottom Section */}
          <section className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <RecruitmentPipeline dashboard={dashboard?.dashboard} />
            </div>

            <div className="space-y-6 xl:col-span-5">
              <QuickActions />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

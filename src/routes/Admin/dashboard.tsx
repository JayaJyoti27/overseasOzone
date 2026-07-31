import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  UserPlus,
  FileText,
  BriefcaseBusiness,
  ClipboardCheck,
  ShieldAlert,
  Loader2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDashboard } from "@/lib/admin/api";
import { DotGrid, Blob } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/dashboard")({
  component: Dashboard,
});

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number | string;
  icon: any;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-border bg-white p-6 shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)] transition hover:-translate-y-1">
      <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy">{value}</h2>
        </div>

        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-wash text-blue transition group-hover:bg-blue group-hover:text-white">
          <Icon size={22} />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-ink/60">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
        Live data
      </div>
    </div>
  );
}

function ListPanel({
  title,
  emptyLabel,
  items,
  renderItem,
}: {
  title: string;
  emptyLabel: string;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)]">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
        <span className="rounded-full bg-blue-wash px-2.5 py-1 text-[11px] font-bold text-blue">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 py-6 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-wash text-blue">
            <FileText size={18} />
          </span>
          <p className="text-sm text-ink">{emptyLabel}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-1">{items.map(renderItem)}</div>
      )}
    </div>
  );
}

function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
      setError("Couldn't load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
          <AlertCircle size={28} />
        </span>
        <p className="text-ink">{error}</p>
        <Button onClick={loadDashboard} className="rounded-full bg-navy px-6 hover:bg-blue">
          Retry
        </Button>
      </div>
    );
  }

  const stats = dashboard?.statistics ?? {};

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] bg-blue-wash px-8 py-8">
        <Blob
          className="-right-16 -top-24 h-72 w-72 opacity-60"
          color="var(--color-blue-soft, #DCE9FB)"
        />
        <DotGrid className="left-8 top-6 h-20 w-24 opacity-70" />

        <div className="relative flex items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Overview
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-navy">Admin Dashboard</h1>
            <p className="mt-1 text-ink">
              Overview of portal activities across candidates, employers and jobs
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates ?? 0}
          icon={Users}
          accent="bg-navy"
        />
        <StatCard
          title="New Candidate Registrations"
          value={stats.newCandidateRegistrations ?? 0}
          icon={UserPlus}
          accent="bg-emerald-500"
        />
        <StatCard
          title="Total Employers"
          value={stats.totalEmployers ?? 0}
          icon={Building2}
          accent="bg-blue"
        />
        <StatCard
          title="Active Employers"
          value={stats.activeEmployers ?? 0}
          icon={ShieldCheck}
          accent="bg-blue-soft"
        />
        <StatCard
          title="Active Job Orders"
          value={stats.activeJobOrders ?? 0}
          icon={BriefcaseBusiness}
          accent="bg-gold"
        />
        <StatCard
          title="Applications Received"
          value={stats.applicationsReceived ?? 0}
          icon={FileText}
          accent="bg-navy"
        />
        <StatCard
          title="Pending Candidate Reviews"
          value={stats.pendingCandidateReviews ?? 0}
          icon={ClipboardCheck}
          accent="bg-amber-500"
        />
        <StatCard
          title="Pending Employer Reviews"
          value={stats.pendingEmployerReviews ?? 0}
          icon={ShieldAlert}
          accent="bg-amber-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListPanel
          title="Pending Employer Reviews"
          emptyLabel="No pending employers"
          items={dashboard?.pendingEmployers ?? []}
          renderItem={(e: any) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-blue-wash/50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy font-display text-xs font-bold text-white">
                  {(e.company_name || "?")
                    .split(" ")
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <p className="font-medium text-navy">{e.company_name}</p>
                  <p className="text-sm text-ink">{e.email}</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Pending
              </span>
            </div>
          )}
        />

        <ListPanel
          title="Pending Requirement Reviews"
          emptyLabel="No pending requirements"
          items={dashboard?.pendingRequirements ?? []}
          renderItem={(r: any) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-blue-wash/50"
            >
              <div>
                <p className="font-medium text-navy">{r.role}</p>
                <p className="text-sm text-ink">{r.company_name}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Pending
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
}

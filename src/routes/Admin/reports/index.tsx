import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  Users,
  FileText,
  BriefcaseBusiness,
  ClipboardCheck,
  Stethoscope,
  Plane,
  PlaneTakeoff,
  Loader2,
  AlertCircle,
  TrendingUp,
  Download,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getReportsOverview,
  getCandidateReport,
  getEmployerReport,
  getRecruitmentReport,
  downloadCandidateReportCsv,
} from "@/lib/admin/api";
import { DotGrid, Blob } from "@/components/site/decor";
import SimpleBarChart from "./SimpleBarChart";

export const Route = createFileRoute("/Admin/reports/")({
  component: ReportsPage,
});

/*
|--------------------------------------------------------------------------
| Shared palette + helpers
|--------------------------------------------------------------------------
| One accent rotation reused everywhere on this page so every chart and
| breakdown reads as the same family, whichever section you're looking at.
*/
const ACCENTS = ["#0B1F3A", "#1E4D8C", "#C9A646", "#10B981", "#F59E0B", "#DCE9FB"];

function formatLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toChartData(record: Record<string, number> | undefined, limit = 8) {
  const entries = Object.entries(record ?? {})
    .map(([name, value]) => ({ name: formatLabel(name), value }))
    .sort((a, b) => b.value - a.value);

  if (entries.length <= limit) return entries;

  const top = entries.slice(0, limit - 1);
  const rest = entries.slice(limit - 1).reduce((sum, e) => sum + e.value, 0);
  return [...top, { name: "Other", value: rest }];
}

/*
|--------------------------------------------------------------------------
| Building blocks
|--------------------------------------------------------------------------
*/
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
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy">{value}</h2>
        </div>

        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-wash transition group-hover:text-white"
          style={{ color: accent }}
        >
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

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink/60">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/* The one distinctive element on this page: a proportional breakdown list
   for categorical data (statuses, funnel stages, approval states) — reads
   at a glance without needing a full chart for a handful of categories. */
function BreakdownBars({ data }: { data: { name: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-ink/50">No data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((row, i) => {
        const pct = Math.round((row.value / max) * 100);
        return (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between text-xs font-medium">
              <span className="text-navy">{row.name}</span>
              <span className="text-ink/60">{row.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-wash">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: ACCENTS[i % ACCENTS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-blue-wash px-8 py-8">
      <Blob
        className="-right-16 -top-24 h-72 w-72 opacity-60"
        color="var(--color-blue-soft, #DCE9FB)"
      />
      <DotGrid className="left-8 top-6 h-20 w-24 opacity-70" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
          <BarChart3 className="h-3.5 w-3.5" /> Reports
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-ink">
          Real-time totals, trends, and breakdowns across candidates, employers, and recruitment
        </p>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/
function ReportsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [candidates, setCandidates] = useState<any>(null);
  const [employers, setEmployers] = useState<any>(null);
  const [recruitment, setRecruitment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [ov, cand, emp, rec] = await Promise.all([
        getReportsOverview(),
        getCandidateReport(),
        getEmployerReport(),
        getRecruitmentReport(),
      ]);
      setOverview(ov);
      setCandidates(cand);
      setEmployers(emp);
      setRecruitment(rec);
    } catch (err: any) {
      console.error("Failed to load reports:", err);
      setError(err?.response?.data?.message || "Couldn't load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      await downloadCandidateReportCsv();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading reports…</p>
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
        <Button onClick={load} className="rounded-full bg-navy px-6 hover:bg-blue">
          Retry
        </Button>
      </div>
    );
  }

  const summary = overview?.summary ?? {};
  const pending = overview?.pending ?? {};

  return (
    <div className="space-y-8">
      <Hero />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="rounded-full bg-blue-wash p-1">
          <TabsTrigger value="overview" className="rounded-full">
            Overview
          </TabsTrigger>
          <TabsTrigger value="candidates" className="rounded-full">
            Candidates
          </TabsTrigger>
          <TabsTrigger value="employers" className="rounded-full">
            Employers
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="rounded-full">
            Recruitment
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------- */}
        {/* Overview                                                   */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employers"
              value={summary.employers ?? 0}
              icon={Building2}
              accent={ACCENTS[0]}
            />
            <StatCard
              title="Total Candidates"
              value={summary.candidates ?? 0}
              icon={Users}
              accent={ACCENTS[1]}
            />
            <StatCard
              title="Total Requirements"
              value={summary.requirements ?? 0}
              icon={FileText}
              accent={ACCENTS[2]}
            />
            <StatCard
              title="Total Job Orders"
              value={summary.jobOrders ?? 0}
              icon={BriefcaseBusiness}
              accent={ACCENTS[3]}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Applications"
              value={summary.applications ?? 0}
              icon={FileText}
              accent={ACCENTS[4]}
            />
            <StatCard
              title="Interviews"
              value={summary.interviews ?? 0}
              icon={ClipboardCheck}
              accent={ACCENTS[1]}
            />
            <StatCard
              title="Medicals"
              value={summary.medicals ?? 0}
              icon={Stethoscope}
              accent={ACCENTS[2]}
            />
            <StatCard
              title="Deployments"
              value={summary.deployments ?? 0}
              icon={PlaneTakeoff}
              accent={ACCENTS[3]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Pending Review" subtitle="Items waiting on admin action right now">
              <BreakdownBars
                data={[
                  { name: "Pending Employers", value: pending.pendingEmployers ?? 0 },
                  { name: "Pending Requirements", value: pending.pendingRequirements ?? 0 },
                  { name: "Pending Medicals", value: pending.pendingMedicals ?? 0 },
                  { name: "Pending Visas", value: pending.pendingVisas ?? 0 },
                  { name: "Pending Deployments", value: pending.pendingDeployments ?? 0 },
                ]}
              />
            </SectionCard>

            <SectionCard title="Recruitment Funnel" subtitle="Applications by internal stage">
              <BreakdownBars data={toChartData(overview?.funnel, 6)} />
            </SectionCard>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------- */}
        {/* Candidates                                                 */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="candidates" className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Candidates"
              value={candidates?.summary?.total ?? 0}
              icon={Users}
              accent={ACCENTS[0]}
            />
            <StatCard
              title="Active"
              value={candidates?.summary?.active ?? 0}
              icon={Users}
              accent={ACCENTS[3]}
            />
            <StatCard
              title="Inactive"
              value={candidates?.summary?.inactive ?? 0}
              icon={Users}
              accent={ACCENTS[4]}
            />
            <StatCard
              title="Verified"
              value={candidates?.summary?.verified ?? 0}
              icon={ClipboardCheck}
              accent={ACCENTS[1]}
            />
          </div>

          <SectionCard
            title="Candidate Registrations"
            subtitle="Monthly new candidate sign-ups"
            action={
              <Button
                onClick={handleExport}
                disabled={exporting}
                variant="outline"
                className="gap-2 rounded-full border-blue/30 text-blue hover:bg-blue-wash"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export CSV
              </Button>
            }
          >
            <SimpleBarChart data={toChartData(candidates?.monthly, 12)} color={ACCENTS[1]} />
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Candidates by Country" subtitle="Where candidates are based">
              <SimpleBarChart data={toChartData(candidates?.countries, 8)} color={ACCENTS[0]} />
            </SectionCard>

            <SectionCard
              title="Candidates by Profession"
              subtitle="Top professions on the platform"
            >
              <BreakdownBars data={toChartData(candidates?.professions, 8)} />
            </SectionCard>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------- */}
        {/* Employers                                                  */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="employers" className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employers"
              value={employers?.summary?.total ?? 0}
              icon={Building2}
              accent={ACCENTS[0]}
            />
            <StatCard
              title="Active"
              value={employers?.summary?.active ?? 0}
              icon={Building2}
              accent={ACCENTS[3]}
            />
            <StatCard
              title="Pending"
              value={employers?.summary?.pending ?? 0}
              icon={Building2}
              accent={ACCENTS[2]}
            />
            <StatCard
              title="Suspended"
              value={employers?.summary?.suspended ?? 0}
              icon={Building2}
              accent={ACCENTS[4]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Employers by Country" subtitle="Where employer accounts are based">
              <SimpleBarChart data={toChartData(employers?.countries, 8)} color={ACCENTS[0]} />
            </SectionCard>

            <SectionCard title="Approval Status" subtitle="Employer accounts by approval state">
              <BreakdownBars data={toChartData(employers?.approval, 6)} />
            </SectionCard>
          </div>

          <SectionCard title="Top Employers" subtitle="Ranked by total job orders posted">
            {employers?.topEmployers?.length ? (
              <div className="space-y-2">
                {employers.topEmployers.map((e: any, i: number) => (
                  <div
                    key={e.employerId}
                    className="flex items-center justify-between rounded-2xl bg-blue-wash/40 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-wash text-xs font-bold text-blue">
                        {i === 0 ? <Trophy size={14} /> : i + 1}
                      </span>
                      <span className="text-sm font-medium text-navy">{e.companyName}</span>
                    </div>
                    <span className="font-display text-sm font-bold text-navy">
                      {e.totalJobs} job{e.totalJobs === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-ink/50">No job orders yet.</p>
            )}
          </SectionCard>
        </TabsContent>

        {/* ---------------------------------------------------------- */}
        {/* Recruitment                                                */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Applications"
              value={recruitment?.summary?.applications ?? 0}
              icon={FileText}
              accent={ACCENTS[0]}
            />
            <StatCard
              title="Interviews"
              value={recruitment?.summary?.interviews ?? 0}
              icon={ClipboardCheck}
              accent={ACCENTS[1]}
            />
            <StatCard
              title="Medicals"
              value={recruitment?.summary?.medicals ?? 0}
              icon={Stethoscope}
              accent={ACCENTS[2]}
            />
            <StatCard
              title="Visas"
              value={recruitment?.summary?.visas ?? 0}
              icon={Plane}
              accent={ACCENTS[4]}
            />
            <StatCard
              title="Deployments"
              value={recruitment?.summary?.deployments ?? 0}
              icon={PlaneTakeoff}
              accent={ACCENTS[3]}
            />
          </div>

          <SectionCard title="Monthly Applications" subtitle="Applications received over time">
            <SimpleBarChart data={toChartData(recruitment?.monthly, 12)} color={ACCENTS[1]} />
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Medical Status">
              <BreakdownBars data={toChartData(recruitment?.medicals, 6)} />
            </SectionCard>
            <SectionCard title="Visa Status">
              <BreakdownBars data={toChartData(recruitment?.visas, 6)} />
            </SectionCard>
            <SectionCard title="Deployment Status">
              <BreakdownBars data={toChartData(recruitment?.deployments, 6)} />
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

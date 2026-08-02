import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getRequirement,
  approveRequirement,
  rejectRequirement,
  requestClarification,
  convertRequirement,
} from "@/lib/admin/api";

import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Building2,
  Globe2,
  Users,
  Clock,
  Wallet,
  CalendarClock,
  Mail,
  Phone,
  UserRound,
  FileText,
  GraduationCap,
  MessageSquareText,
  CheckCircle2,
  HelpCircle,
  ArrowRightLeft,
  XCircle,
  Check,
  Home,
  Bus,
  UtensilsCrossed,
} from "lucide-react";
import { DotGrid, Blob } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/requirements/$id")({
  component: RequirementDetails,
});

const DOT_COLORS: Record<string, string> = {
  approved: "bg-emerald-500",
  converted: "bg-emerald-500",
  pending: "bg-amber-500",
  clarification: "bg-amber-500",
  rejected: "bg-red-500",
};

function StatusPill({ status }: { status?: string }) {
  const key = (status || "").toLowerCase();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy shadow-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[key] ?? "bg-blue"}`} />
      {status || "-"}
    </span>
  );
}

const STEP_ORDER = ["pending", "clarification", "approved", "converted"];
const STEP_LABELS: Record<string, string> = {
  pending: "Submitted",
  clarification: "Clarification requested",
  approved: "Approved",
  converted: "Converted",
};

function StatusTimeline({ status }: { status?: string }) {
  const key = (status || "pending").toLowerCase();

  if (key === "rejected") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <XCircle size={16} />
        This requirement was rejected
      </div>
    );
  }

  const currentIndex = Math.max(STEP_ORDER.indexOf(key), 0);

  return (
    <div className="flex items-start">
      {STEP_ORDER.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <div key={step} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-2 px-1">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition ${
                  done ? "bg-blue text-white" : "bg-ink/10 text-ink/40"
                }`}
              >
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`w-20 text-center text-[10.5px] font-medium leading-snug ${
                  done ? "text-navy" : "text-ink/40"
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < STEP_ORDER.length - 1 && (
              <span
                className={`mx-1 mt-3.5 h-[2px] flex-1 rounded ${
                  i < currentIndex ? "bg-blue" : "bg-ink/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_50px_-32px_rgba(11,31,58,0.4)] ${className}`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-wash text-blue">
            <Icon size={16} strokeWidth={2.2} />
          </span>
        )}
        <h3 className="font-display text-base font-semibold text-navy">{title}</h3>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Info({
  label,
  value,
  muted = false,
}: {
  label: string;
  value?: string | number;
  muted?: boolean;
}) {
  const isEmpty = value === undefined || value === null || value === "";
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/70 py-3.5 last:border-b-0">
      <span className="shrink-0 text-[13px] font-medium text-ink/55">{label}</span>
      <span
        className={`truncate text-right text-sm ${
          isEmpty || muted ? "text-ink/35" : "font-semibold text-navy"
        }`}
      >
        {isEmpty ? "—" : value}
      </span>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | number;
}) {
  const isEmpty = value === undefined || value === null || value === "";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-white p-5 pl-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="absolute inset-y-0 left-0 w-1 bg-blue/70" />
      <div className="flex items-center gap-2.5 text-ink/45">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-wash text-blue">
          <Icon size={14} strokeWidth={2.2} />
        </span>
        <span className="text-[10.5px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`mt-3 truncate text-[16px] font-bold ${isEmpty ? "text-ink/30" : "text-navy"}`}>
        {isEmpty ? "Not set" : value}
      </p>
    </div>
  );
}

function AmenityBadge({
  icon: Icon,
  label,
  provided,
}: {
  icon: any;
  label: string;
  provided: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold ${
        provided
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border bg-ink/[0.03] text-ink/35"
      }`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

function initials(name?: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function formatDate(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSalary(min?: number | string, max?: number | string, currency?: string) {
  if (!min && !max) return undefined;
  const fmt = (n?: number | string) => (n || n === 0 ? Number(n).toLocaleString() : "?");
  return `${fmt(min)} – ${fmt(max)}${currency ? ` ${currency}` : ""}`;
}

function RequirementDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requirement, setRequirement] = useState<any>();

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);

    try {
      const data = await getRequirement(id);
      setRequirement(data.data ?? data);
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    await approveRequirement(id);
    load();
  }

  async function reject() {
    await rejectRequirement(id, "Rejected by Admin");
    load();
  }

  async function clarify() {
    await requestClarification(id, "Please provide additional details.");
    load();
  }

  async function convert() {
    await convertRequirement(id);
    load();
  }

  if (loading || !requirement)
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading requirement…</p>
      </div>
    );

  const salaryLabel = formatSalary(
    requirement.salary_min,
    requirement.salary_max,
    requirement.currency,
  );

  return (
    <div className="relative px-6 py-8 md:px-10 md:py-10">
      <Blob
        className="pointer-events-none absolute -right-24 -top-28 h-[26rem] w-[26rem] opacity-40"
        color="var(--color-blue-soft, #DCE9FB)"
      />

      <div className="relative mx-auto max-w-6xl space-y-10">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate({ to: "/Admin/requirements" })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 transition hover:text-blue"
        >
          <ArrowLeft size={15} />
          Requirements
        </button>

        {/* Header */}
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-white via-white to-blue-wash/70 p-10 shadow-[0_20px_60px_-32px_rgba(11,31,58,0.4)]">
          <DotGrid className="pointer-events-none absolute right-8 top-8 h-16 w-20 opacity-60" />

          <div className="relative flex flex-wrap items-start justify-between gap-8">
            <div className="flex items-start gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-navy text-white shadow-lg shadow-navy/20">
                <FileText size={22} strokeWidth={2} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue">
                    Requirement
                  </span>
                  <span className="rounded-full bg-blue-wash px-2 py-0.5 font-mono text-[10px] text-blue/70">
                    #{String(id).slice(0, 8)}
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold capitalize leading-tight text-navy">
                  {requirement.role || "Untitled role"}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/70">
                  <Building2 size={14} />
                  {requirement.company_name || "Unknown employer"}
                </p>
              </div>
            </div>

            <StatusPill status={requirement.status} />
          </div>

          <div className="relative mt-10 max-w-xl">
            <StatusTimeline status={requirement.status} />
          </div>
        </div>

        {/* Key facts strip */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          <StatChip icon={Globe2} label="Country" value={requirement.country} />
          <StatChip icon={Users} label="Headcount" value={requirement.headcount} />
          <StatChip icon={Clock} label="Timeline" value={requirement.timeline} />
          <StatChip icon={Wallet} label="Salary" value={salaryLabel} />
          <StatChip icon={CalendarClock} label="Working Hours" value={requirement.working_hours} />
        </div>

        {/* Main layout: content + sticky sidebar */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Main column */}
          <div className="space-y-8 lg:col-span-2">
            <Panel title="Requirement Information" icon={FileText}>
              <div className="grid gap-x-10 sm:grid-cols-2">
                <Info label="Role" value={requirement.role} />
                <Info label="Country" value={requirement.country} />
                <Info label="Sector" value={requirement.sector} />
                <Info label="Headcount" value={requirement.headcount} />
                <Info label="Timeline" value={requirement.timeline} />
                <Info
                  label="Contract Duration"
                  value={
                    requirement.contract_duration
                      ? `${requirement.contract_duration} months`
                      : undefined
                  }
                />
                <Info label="Working Hours" value={requirement.working_hours} />
              </div>
            </Panel>

            <Panel title="Compensation & Benefits" icon={Wallet}>
              <div className="rounded-2xl bg-gradient-to-br from-navy to-blue px-7 py-6 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                  Salary Range
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {salaryLabel ?? "Not specified"}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <AmenityBadge
                  icon={Home}
                  label="Accommodation"
                  provided={!!requirement.accommodation}
                />
                <AmenityBadge icon={Bus} label="Transport" provided={!!requirement.transport} />
                <AmenityBadge icon={UtensilsCrossed} label="Food" provided={!!requirement.food} />
              </div>

              {requirement.benefits && (
                <div className="mt-6 border-t border-border/70 pt-5">
                  <p className="text-[13px] font-medium text-ink/55">Other Benefits</p>
                  <p className="mt-1.5 text-sm text-navy">{requirement.benefits}</p>
                </div>
              )}
            </Panel>

            {requirement.job_description && (
              <Panel title="Job Description" icon={FileText}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {requirement.job_description}
                </p>
              </Panel>
            )}

            {requirement.qualifications && (
              <Panel title="Required Qualifications" icon={GraduationCap}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {requirement.qualifications}
                </p>
              </Panel>
            )}

            {requirement.message && (
              <Panel title="Additional Notes" icon={MessageSquareText}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {requirement.message}
                </p>
              </Panel>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-6 lg:h-fit">
            <Panel title="Point of Contact" icon={UserRound}>
              <div className="flex items-center gap-3.5 border-b border-border/70 pb-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-wash text-sm font-semibold text-blue">
                  {initials(requirement.contact_person)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">
                    {requirement.contact_person || "—"}
                  </p>
                  <p className="text-xs text-ink/50">Point of contact</p>
                </div>
              </div>

              <div className="mt-1">
                <Info label="Submitted By" value={requirement.company_name} />
                <Info label="Submitted On" value={formatDate(requirement.created_at)} />

                {requirement.contact_email ? (
                  <a
                    href={`mailto:${requirement.contact_email}`}
                    className="flex items-center justify-between gap-4 border-b border-border/70 py-3.5 text-sm transition hover:text-blue"
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink/55">
                      <Mail size={13} /> Email
                    </span>
                    <span className="truncate font-semibold text-navy">
                      {requirement.contact_email}
                    </span>
                  </a>
                ) : (
                  <Info label="Contact Email" value={undefined} />
                )}

                {requirement.contact_phone ? (
                  <a
                    href={`tel:${requirement.contact_phone}`}
                    className="flex items-center justify-between gap-4 py-3.5 text-sm transition hover:text-blue"
                  >
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink/55">
                      <Phone size={13} /> Phone
                    </span>
                    <span className="truncate font-semibold text-navy">
                      {requirement.contact_phone}
                    </span>
                  </a>
                ) : (
                  <Info label="Contact Phone" value={undefined} />
                )}
              </div>
            </Panel>

            {/* Decision panel */}
            <div className="rounded-[28px] border border-navy bg-navy p-8 text-white shadow-[0_20px_50px_-28px_rgba(11,31,58,0.6)]">
              <h3 className="font-display text-base font-semibold">Decision</h3>
              <p className="mt-1.5 text-xs text-white/50">
                Choose how to move this requirement forward.
              </p>

              <div className="mt-6 space-y-3">
                <Button
                  className="h-11 w-full justify-center gap-2 rounded-full bg-white text-sm font-semibold text-navy hover:bg-white/90"
                  onClick={approve}
                >
                  <CheckCircle2 size={16} />
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 w-full justify-center gap-2 rounded-full border border-white/15 bg-white/10 text-sm font-medium text-white hover:bg-white/20"
                  onClick={clarify}
                >
                  <HelpCircle size={16} />
                  Request Clarification
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 w-full justify-center gap-2 rounded-full border border-white/15 bg-white/10 text-sm font-medium text-white hover:bg-white/20"
                  onClick={convert}
                >
                  <ArrowRightLeft size={16} />
                  Convert to Job Order
                </Button>

                <div className="!mt-5 border-t border-white/10 pt-5">
                  <button
                    onClick={reject}
                    className="flex w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-red-300 transition hover:text-red-200"
                  >
                    <XCircle size={16} />
                    Reject requirement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

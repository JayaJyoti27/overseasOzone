import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  getRequirements,
  rejectRequirement,
  requestClarification,
  convertRequirement,
} from "@/lib/admin/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  FileText,
  Inbox,
  HelpCircle,
  ArrowRightLeft,
  X,
} from "lucide-react";
import { DotGrid, Blob } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/requirements/")({
  component: RequirementsPage,
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[key] ?? "bg-blue"}`} />
      {status || "-"}
    </span>
  );
}

function initials(name?: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join("");
}

// header + every row share this grid so columns always line up and fill width
const GRID_COLS = "grid-cols-[1.3fr_1.1fr_0.8fr_0.8fr_1fr_1.9fr]";

function RequirementsPage() {
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRequirements();
  }, []);

  async function loadRequirements() {
    setLoading(true);

    try {
      const data = await getRequirements();
      setRequirements(Array.isArray(data) ? data : (data.data ?? []));
    } finally {
      setLoading(false);
    }
  }

  async function reject(id: string) {
    await rejectRequirement(id, "Rejected by Admin");
    loadRequirements();
  }

  async function clarification(id: string) {
    await requestClarification(id, "Please provide additional details.");
    loadRequirements();
  }

  async function convert(id: string) {
    const result = await convertRequirement(id);
    const jobOrderId = result?.jobOrder?.id;

    if (jobOrderId) {
      navigate({ to: "/Admin/job-orders/$id", params: { id: jobOrderId } });
    } else {
      loadRequirements();
    }
  }

  const filtered = useMemo(() => {
    return requirements.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
    );
  }, [requirements, search]);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading requirements…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero banner — matches Dashboard */}
      <div className="relative overflow-hidden rounded-[28px] bg-blue-wash px-8 py-8">
        <Blob
          className="-right-16 -top-24 h-72 w-72 opacity-60"
          color="var(--color-blue-soft, #DCE9FB)"
        />
        <DotGrid className="left-8 top-6 h-20 w-24 opacity-70" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
              <FileText className="h-3.5 w-3.5" /> Requirements
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-navy">Requirements</h1>
            <p className="mt-1 text-ink">
              {filtered.length} of {requirements.length} requirement
              {requirements.length === 1 ? "" : "s"} · review and route employer submissions
            </p>
          </div>

          <div className="relative w-80 max-w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
            <Input
              className="rounded-full border-none bg-white pl-10 shadow-sm focus-visible:ring-blue"
              placeholder="Search by employer, role, country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table card — CSS grid rows, guaranteed full width, no cutoff */}
      <div className="overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)]">
        {/* header row */}
        <div
          className={`grid ${GRID_COLS} items-center gap-3 border-b border-border bg-blue-wash/50 px-6 py-3.5`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Employer
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">Role</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Country
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Headcount
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">Status</span>
          <span className="text-right text-xs font-semibold uppercase tracking-wide text-navy/60">
            Actions
          </span>
        </div>

        {/* rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-16 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-wash text-blue">
              <Inbox size={20} />
            </span>
            <p className="text-sm text-ink">No requirements found.</p>
            <p className="text-xs text-ink/60">Try a different search term.</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className={`grid ${GRID_COLS} cursor-pointer items-center gap-3 border-b border-border px-6 py-3.5 text-sm transition last:border-0 hover:bg-blue-wash/30`}
              onClick={() => navigate({ to: `/Admin/requirements/${req.id}` })}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-wash text-[11px] font-semibold text-blue">
                  {initials(req.company_name)}
                </span>
                <span className="truncate font-medium text-navy">{req.company_name}</span>
              </span>
              <span className="truncate capitalize text-ink/80">{req.role}</span>
              <span className="truncate text-ink/80">{req.country}</span>
              <span className="truncate text-ink/80">{req.headcount}</span>
              <span>
                <StatusPill status={req.status} />
              </span>
              <div
                className="flex items-center justify-end gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {req.status === "converted" ? (
                  <Button
                    size="icon"
                    variant="outline"
                    title="View job order"
                    className="h-8 w-8 rounded-full border-border hover:border-blue hover:text-blue"
                    onClick={() =>
                      navigate({
                        to: "/Admin/job-orders/$id",
                        params: { id: req.converted_job_order_id },
                      })
                    }
                  >
                    <ArrowRightLeft size={14} />
                  </Button>
                ) : req.status === "rejected" ? (
                  <span className="text-xs font-medium text-ink/40">Rejected</span>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      title="Request clarification"
                      className="h-8 w-8 rounded-full bg-blue-wash text-blue hover:bg-blue-soft"
                      onClick={() => clarification(req.id)}
                    >
                      <HelpCircle size={14} />
                    </Button>
                    <Button
                      size="icon"
                      title="Convert to job order"
                      className="h-8 w-8 rounded-full bg-navy hover:bg-blue"
                      onClick={() => convert(req.id)}
                    >
                      <ArrowRightLeft size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      title="Reject"
                      className="h-8 w-8 rounded-full"
                      onClick={() => reject(req.id)}
                    >
                      <X size={14} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

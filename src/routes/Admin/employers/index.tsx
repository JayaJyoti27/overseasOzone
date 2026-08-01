import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { getEmployers, suspendEmployer, activateEmployer } from "@/lib/admin/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Building2, Inbox } from "lucide-react";
import { DotGrid, Blob } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/employers/")({
  component: EmployersPage,
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  suspended: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
};

function StatusPill({ status }: { status?: string }) {
  const key = (status || "").toLowerCase();
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[key] ?? "bg-blue-wash text-blue"
      }`}
    >
      {status || "-"}
    </span>
  );
}

// grid template shared by header + rows so columns always line up
const GRID_COLS = "grid-cols-[1.4fr_1.6fr_1fr_0.9fr_1.3fr]";

function EmployersPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [employers, setEmployers] = useState<any[]>([]);

  useEffect(() => {
    loadEmployers();
  }, []);

  async function loadEmployers() {
    setLoading(true);

    try {
      const data = await getEmployers({ approvalStatus: "approved" });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      // Belt-and-braces: even if the backend filter changes, never show
      // an employer that hasn't been approved yet on this page — pending
      // ones are reviewed from Notifications instead.
      setEmployers(list.filter((e: any) => e.approval_status === "approved"));
    } finally {
      setLoading(false);
    }
  }

  async function suspend(id: string) {
    await suspendEmployer(id);
    loadEmployers();
  }

  async function activate(id: string) {
    await activateEmployer(id);
    loadEmployers();
  }

  const filtered = useMemo(() => {
    return employers.filter((e) => JSON.stringify(e).toLowerCase().includes(search.toLowerCase()));
  }, [search, employers]);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading employers…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-blue-wash px-8 py-8">
        <Blob
          className="-right-16 -top-24 h-72 w-72 opacity-60"
          color="var(--color-blue-soft, #DCE9FB)"
        />
        <DotGrid className="left-8 top-6 h-20 w-24 opacity-70" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
              <Building2 className="h-3.5 w-3.5" /> Employers
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-navy">Employers</h1>
            <p className="mt-1 text-ink">
              Active employers only — new registrations are reviewed from Notifications.
            </p>
          </div>

          <div className="relative w-80 max-w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
            <Input
              className="rounded-full border-none bg-white pl-10 shadow-sm focus-visible:ring-blue"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table card — CSS grid rows, guaranteed full width */}
      <div className="overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)]">
        {/* header row */}
        <div className={`grid ${GRID_COLS} gap-2 border-b border-border bg-blue-wash/50 px-6 py-4`}>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Company</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Email</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Country</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Status</span>
          <span className="text-right text-xs font-semibold uppercase tracking-wide text-navy">
            Actions
          </span>
        </div>

        {/* rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-wash text-blue">
              <Inbox size={20} />
            </span>
            <p className="text-sm text-ink">No employers found.</p>
          </div>
        ) : (
          filtered.map((e) => (
            <div
              key={e.id}
              className={`grid ${GRID_COLS} cursor-pointer items-center gap-2 border-b border-border px-6 py-4 transition last:border-0 hover:bg-blue-wash/40`}
              onClick={() => navigate({ to: `/Admin/employers/${e.id}` })}
            >
              <span className="truncate font-medium text-navy">{e.company_name}</span>
              <span className="truncate text-ink">{e.email}</span>
              <span className="truncate text-ink">{e.country}</span>
              <span>
                <StatusPill status={e.status} />
              </span>
              <div
                className="flex items-center justify-end gap-2"
                onClick={(ev) => ev.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full bg-blue-wash px-3 text-xs text-blue hover:bg-blue-soft"
                  onClick={() => activate(e.id)}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-full px-3 text-xs"
                  onClick={() => suspend(e.id)}
                >
                  Suspend
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

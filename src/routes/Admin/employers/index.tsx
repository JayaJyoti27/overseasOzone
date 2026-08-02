import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { getEmployers, suspendEmployer, activateEmployer } from "@/lib/admin/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Building2, Inbox } from "lucide-react";

export const Route = createFileRoute("/Admin/employers/")({
  component: EmployersPage,
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15",
  suspended: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
  rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
};

function StatusPill({ status }: { status?: string }) {
  const key = (status || "").toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[key] ?? "bg-blue-wash text-blue ring-1 ring-inset ring-blue/15"
      }`}
    >
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
const GRID_COLS = "grid-cols-[1.6fr_1.6fr_1fr_0.9fr_1.3fr]";

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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={28} />
        <p className="text-sm text-ink">Loading employers…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-wash text-blue">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-navy">Employers</h1>
            <p className="text-sm text-ink/80">
              Active employers — new registrations are reviewed from Notifications.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-xs sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <Input
            className="rounded-full border-border bg-white pl-9 shadow-sm focus-visible:ring-blue/40"
            placeholder="Search employers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {/* header row */}
        <div
          className={`grid ${GRID_COLS} items-center gap-3 border-b border-border bg-blue-wash/40 px-6 py-3.5`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Company
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">Email</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Country
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
            <p className="text-sm text-ink">No employers found.</p>
            <p className="text-xs text-ink/60">Try a different search term.</p>
          </div>
        ) : (
          filtered.map((e) => (
            <div
              key={e.id}
              className={`grid ${GRID_COLS} cursor-pointer items-center gap-3 border-b border-border px-6 py-3.5 text-sm transition last:border-0 hover:bg-blue-wash/25`}
              onClick={() => navigate({ to: `/Admin/employers/${e.id}` })}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-wash text-[11px] font-semibold text-blue">
                  {initials(e.company_name)}
                </span>
                <span className="truncate font-medium text-navy">{e.company_name}</span>
              </span>
              <span className="truncate text-ink/80">{e.email}</span>
              <span className="truncate text-ink/80">{e.country}</span>
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
                  className="h-8 rounded-full bg-blue-wash px-3.5 text-xs font-medium text-blue shadow-none hover:bg-blue-soft"
                  onClick={() => activate(e.id)}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 rounded-full px-3.5 text-xs font-medium shadow-none"
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

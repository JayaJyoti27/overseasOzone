import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getJobOrders } from "@/lib/admin/api";
import { statusLabel, statusStyle } from "@/lib/admin/jobOrderStatus";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, BriefcaseBusiness, Inbox } from "lucide-react";
import { DotGrid, Blob } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/job-orders/")({
  component: JobOrdersPage,
});

function StatusPill({ status }: { status?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyle(
        status,
      )}`}
    >
      {statusLabel(status)}
    </span>
  );
}

// header + every row share this grid so columns always line up and fill width
const GRID_COLS = "grid-cols-[1.2fr_1.1fr_0.9fr_0.8fr_1.2fr_0.6fr]";

function JobOrdersPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    try {
      const data = await getJobOrders();
      setOrders(Array.isArray(data) ? data : (data.data ?? []));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => JSON.stringify(o).toLowerCase().includes(search.toLowerCase()));
  }, [orders, search]);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading job orders…</p>
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
              <BriefcaseBusiness className="h-3.5 w-3.5" /> Job Orders
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-navy">Job Orders</h1>
            <p className="mt-1 text-ink">Recruitment management</p>
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

      {/* Table card — CSS grid rows, guaranteed full width, no cutoff */}
      <div className="overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)]">
        {/* header row */}
        <div className={`grid ${GRID_COLS} gap-2 border-b border-border bg-blue-wash/50 px-6 py-4`}>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Employer</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Title</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Country</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Vacancies</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy">Status</span>
          <span className="text-right text-xs font-semibold uppercase tracking-wide text-navy">
            &nbsp;
          </span>
        </div>

        {/* rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-wash text-blue">
              <Inbox size={20} />
            </span>
            <p className="text-sm text-ink">No job orders found.</p>
          </div>
        ) : (
          filtered.map((job) => (
            <div
              key={job.id}
              className={`grid ${GRID_COLS} cursor-pointer items-center gap-2 border-b border-border px-6 py-4 transition last:border-0 hover:bg-blue-wash/40`}
              onClick={() => navigate({ to: `/Admin/job-orders/${job.id}` })}
            >
              <span className="truncate font-medium text-navy">{job.employer?.company_name}</span>
              <span className="truncate text-ink">{job.title}</span>
              <span className="truncate text-ink">{job.country}</span>
              <span className="truncate text-ink">{job.vacancies}</span>
              <span>
                <StatusPill status={job.status} />
              </span>
              <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-3 text-xs"
                  onClick={() => navigate({ to: `/Admin/job-orders/${job.id}` })}
                >
                  View
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

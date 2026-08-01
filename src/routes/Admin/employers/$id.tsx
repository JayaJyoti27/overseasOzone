import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getEmployer, suspendEmployer, activateEmployer } from "@/lib/admin/api";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DotGrid } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/employers/$id")({
  component: EmployerDetails,
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
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        STATUS_STYLES[key] ?? "bg-blue-wash text-blue"
      }`}
    >
      {status || "-"}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-border bg-white p-6 shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)]">
      <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmployerDetails() {
  const { id } = Route.useParams();

  const [loading, setLoading] = useState(true);
  const [employer, setEmployer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployer();
  }, [id]);

  async function loadEmployer() {
    setLoading(true);
    setError(null);

    try {
      const data = await getEmployer(id);
      setEmployer(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to load this employer.");
    } finally {
      setLoading(false);
    }
  }

  async function suspend() {
    setActionPending(true);
    setActionError(null);

    try {
      await suspendEmployer(id);
      await loadEmployer();
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? "Unable to suspend this employer.");
    } finally {
      setActionPending(false);
    }
  }

  async function activate() {
    setActionPending(true);
    setActionError(null);

    try {
      await activateEmployer(id);
      await loadEmployer();
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? "Unable to activate this employer.");
    } finally {
      setActionPending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading employer…</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!employer) {
    return <p className="text-ink">Employer not found.</p>;
  }

  return (
    <div className="relative space-y-6">
      <DotGrid className="right-0 top-0 h-20 w-20 opacity-60" />

      <div className="relative flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue">
            Employer Details
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy">
            {employer.company_name}
          </h1>
        </div>

        <StatusPill status={employer.status} />
      </div>

      <div className="relative grid gap-6 lg:grid-cols-2">
        <Panel title="Company Information">
          <div className="space-y-3">
            <Info label="Company" value={employer.company_name} />
            <Info label="Email" value={employer.email} />
            <Info label="Country" value={employer.country} />
            <Info label="Phone" value={employer.phone} />
            <Info label="Website" value={employer.website} />
          </div>
        </Panel>

        <Panel title="Actions">
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full rounded-full bg-blue-wash text-blue hover:bg-blue-soft"
              onClick={activate}
              disabled={actionPending}
            >
              {actionPending ? "Working…" : "Activate Employer"}
            </Button>
            <Button
              variant="destructive"
              className="w-full rounded-full"
              onClick={suspend}
              disabled={actionPending}
            >
              {actionPending ? "Working…" : "Suspend Employer"}
            </Button>
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          </div>
        </Panel>
      </div>

      {employer.documents?.length ? (
        <Panel title="Company Documents">
          <div className="space-y-3">
            {employer.documents.map((doc: any) => (
              <a
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-border p-4 transition hover:border-blue"
              >
                <div>
                  <h4 className="font-semibold text-navy">{doc.file_name}</h4>
                  <p className="text-sm text-ink">{doc.document_type}</p>
                </div>
                <StatusPill status={doc.status} />
              </a>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel title="Submitted Requirements">
        {employer.requirements?.length ? (
          <div className="space-y-3">
            {employer.requirements.map((req: any) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-2xl border border-border p-4 transition hover:border-blue"
              >
                <div>
                  <h4 className="font-semibold text-navy">{req.role}</h4>
                  <p className="text-sm text-ink">{req.country}</p>
                </div>
                <StatusPill status={req.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink">No requirements submitted.</p>
        )}
      </Panel>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-blue-wash/40 px-4 py-3">
      <span className="text-sm font-medium text-navy">{label}</span>
      <span className="text-sm text-ink">{value || "-"}</span>
    </div>
  );
}

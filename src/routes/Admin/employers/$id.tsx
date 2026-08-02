import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getEmployer, suspendEmployer, activateEmployer } from "@/lib/admin/api";
import {
  Loader2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Ban,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/Admin/employers/$id")({
  component: EmployerDetails,
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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
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
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-white p-6 m-6 shadow-sm ${className}`}>
      <h3 className="font-display text-base font-semibold tracking-tight text-navy">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function fileIcon(fileName: string) {
  return /\.(png|jpe?g|webp|gif)$/i.test(fileName) ? ImageIcon : FileText;
}

function DocCard({ doc }: { doc: any }) {
  const Icon = fileIcon(doc.file_name || "");
  return (
    <a
      href={doc.file_url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-wash text-blue transition group-hover:bg-blue group-hover:text-white">
        <Icon size={20} strokeWidth={1.6} />
      </span>
      <p className="text-xs font-medium leading-tight text-navy line-clamp-2">
        {doc.document_type?.replace(/_/g, " ") || doc.file_name}
      </p>
      <StatusPill status={doc.status} />
    </a>
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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={24} />
        <p className="text-sm text-ink">Loading employer…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-4xl items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
        <AlertCircle size={18} className="shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="mx-auto flex max-w-4xl items-center gap-2.5 rounded-2xl border border-border bg-white px-5 py-4 text-sm text-ink">
        <AlertCircle size={18} className="shrink-0 text-ink/50" />
        <p>Employer not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-wash text-lg font-semibold text-blue">
            {initials(employer.company_name)}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue">
              Employer details
            </p>
            <h1 className="mt-1 font-display text-xl font-bold leading-tight text-navy">
              {employer.company_name}
            </h1>
          </div>
        </div>
        <StatusPill status={employer.status} />
      </div>

      {/* Company info */}
      <Panel title="Company information">
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Info label="Company" value={employer.company_name} />
          <Info label="Email" value={employer.email} />
          <Info label="Country" value={employer.country} />
          <Info label="Phone" value={employer.phone} />
          <Info label="Website" value={employer.website} />
        </div>
      </Panel>

      {/* Documents as a card grid */}
      {employer.documents?.length ? (
        <Panel title="Company documents">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {employer.documents.map((doc: any) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        </Panel>
      ) : null}

      {/* Requirements */}
      <Panel title="Submitted requirements">
        {employer.requirements?.length ? (
          <div className="space-y-2">
            {employer.requirements.map((req: any) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition hover:border-blue/40 hover:bg-blue-wash/20"
              >
                <div>
                  <h4 className="text-sm font-medium text-navy">{req.role}</h4>
                  <p className="text-xs text-ink/70">{req.country}</p>
                </div>
                <StatusPill status={req.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-wash text-blue">
              <ClipboardList size={18} />
            </span>
            <p className="text-sm text-ink">No requirements submitted.</p>
          </div>
        )}
      </Panel>

      {/* Actions - bottom, compact */}
      <Panel title="Actions">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={activate}
            disabled={actionPending}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-blue-wash px-4 text-sm font-medium text-blue transition hover:bg-blue-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionPending ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <CheckCircle2 size={15} />
            )}
            {actionPending ? "Working…" : "Activate employer"}
          </button>
          <button
            onClick={suspend}
            disabled={actionPending}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionPending ? <Loader2 className="animate-spin" size={15} /> : <Ban size={15} />}
            {actionPending ? "Working…" : "Suspend employer"}
          </button>
          {actionError && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle size={14} />
              {actionError}
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 truncate text-sm text-navy">{value || "-"}</p>
    </div>
  );
}

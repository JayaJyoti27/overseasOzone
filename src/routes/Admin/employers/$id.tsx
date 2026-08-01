import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getEmployer, suspendEmployer, activateEmployer } from "@/lib/admin/api";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";

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
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[key] ?? "bg-blue-wash text-blue"
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
    <div className={`rounded-xl border border-border bg-white p-5 ${className}`}>
      <h3 className="font-display text-base font-semibold text-navy">{title}</h3>
      <div className="mt-3">{children}</div>
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
      className="flex flex-col items-center gap-2 rounded-lg border border-border p-3.5 text-center transition hover:border-blue hover:shadow-sm"
    >
      <Icon className="text-blue" size={26} strokeWidth={1.6} />
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

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!employer) return <p className="text-sm text-ink">Employer not found.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-13 w-13 h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-blue-wash text-lg font-semibold text-blue">
            {initials(employer.company_name)}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue mt-8">
              Employer details
            </p>
            <h1 className="font-display text-xl font-bold text-navy">{employer.company_name}</h1>
          </div>
        </div>
        <StatusPill status={employer.status} />
      </div>

      {/* Company info */}
      <Panel title="Company information">
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
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
          <div className="space-y-1.5">
            {employer.requirements.map((req: any) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-sm transition hover:border-blue"
              >
                <div>
                  <h4 className="text-sm font-medium text-navy">{req.role}</h4>
                  <p className="text-xs text-ink">{req.country}</p>
                </div>
                <StatusPill status={req.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink">No requirements submitted.</p>
        )}
      </Panel>

      {/* Actions - bottom, compact */}
      <Panel title="Actions">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={activate}
            disabled={actionPending}
            className="h-9 rounded-full bg-blue-wash px-4 text-sm font-medium text-blue transition hover:bg-blue-soft disabled:opacity-60"
          >
            {actionPending ? "Working…" : "Activate employer"}
          </button>
          <button
            onClick={suspend}
            disabled={actionPending}
            className="h-9 rounded-full bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
          >
            {actionPending ? "Working…" : "Suspend employer"}
          </button>
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
        </div>
      </Panel>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-ink/60">{label}</p>
      <p className="truncate text-sm text-navy">{value || "-"}</p>
    </div>
  );
}

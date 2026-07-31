import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getEmployer,
  getEmployerDocuments,
  approveEmployer,
  suspendEmployer,
  activateEmployer,
} from "@/lib/admin/dashboard";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
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
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    loadEmployer();
    loadDocuments();
  }, [id]);

  async function loadEmployer() {
    setLoading(true);

    try {
      const data = await getEmployer(id);
      setEmployer(data.data ?? data);
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments() {
    try {
      const data = await getEmployerDocuments(id);
      setDocuments(data ?? []);
    } catch {
      setDocuments([]);
    }
  }

  async function approve() {
    await approveEmployer(id);
    loadEmployer();
  }

  async function suspend() {
    await suspendEmployer(id);
    loadEmployer();
  }

  async function activate() {
    await activateEmployer(id);
    loadEmployer();
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading employer…</p>
      </div>
    );
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
            <Button className="w-full rounded-full bg-navy hover:bg-blue" onClick={approve}>
              Approve Employer
            </Button>
            <Button
              variant="secondary"
              className="w-full rounded-full bg-blue-wash text-blue hover:bg-blue-soft"
              onClick={activate}
            >
              Activate Employer
            </Button>
            <Button variant="destructive" className="w-full rounded-full" onClick={suspend}>
              Suspend Employer
            </Button>
          </div>
        </Panel>
      </div>

      <Panel title="Verification Documents">
        {documents.length ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-border p-4 transition hover:border-blue"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-blue" size={18} />
                  <div>
                    <h4 className="font-semibold text-navy">
                      {doc.document_type || "Company Certificate"}
                    </h4>
                    <p className="text-sm text-ink">{doc.file_name}</p>
                  </div>
                </div>
                <StatusPill status={doc.status} />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink">No documents uploaded yet.</p>
        )}
      </Panel>

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

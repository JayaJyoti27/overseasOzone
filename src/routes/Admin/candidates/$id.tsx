import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getCandidate, activateCandidate, suspendCandidate } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Circle } from "lucide-react";
import { DotGrid } from "@/components/site/decor";
import { DocumentChecklistCard } from "@/components/Admin/candidates/DocumentChecklistCard";

export const Route = createFileRoute("/Admin/candidates/$id")({
  component: CandidateDetails,
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

function CandidateDetails() {
  const { id } = Route.useParams();

  const [candidate, setCandidate] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidate();
  }, [id]);

  async function loadCandidate() {
    setLoading(true);

    try {
      // lib/admin/api.ts#getCandidate already unwraps { data: { candidate, ... } }
      // and spreads candidate's fields to the top level - use the result as-is.
      const data = await getCandidate(id);
      setCandidate(data);
    } finally {
      setLoading(false);
    }
  }

  async function activate() {
    await activateCandidate(id);
    loadCandidate();
  }

  async function suspend() {
    await suspendCandidate(id);
    loadCandidate();
  }

  if (loading)
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading candidate…</p>
      </div>
    );

  return (
    <div className="relative space-y-6">
      <DotGrid className="right-0 top-0 h-20 w-20 opacity-60 m-4" />

      <div className="relative flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue ml-4">
            Candidate Profile
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy ml-4">
            {candidate.full_name}
          </h1>
        </div>

        <StatusPill status={candidate.status} />
      </div>

      <div className="relative grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2 ml-4">
          <Panel title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <Info label="Name" value={candidate.full_name} />
              <Info label="Email" value={candidate.email} />
              <Info label="Phone" value={candidate.phone} />
              <Info label="Nationality" value={candidate.nationality} />
              <Info label="Preferred Country" value={candidate.preferred_country} />
              <Info label="Passport" value={candidate.passport_number} />
              <Info
                label="Expected Salary"
                value={
                  candidate.expected_salary
                    ? `${candidate.salary_currency ?? ""} ${candidate.expected_salary}`.trim()
                    : undefined
                }
              />
            </div>
          </Panel>

          <Panel title="Skills">
            <div className="flex flex-wrap gap-2 ml-4">
              {candidate.skills?.length ? (
                candidate.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-wash px-3 py-1 text-xs font-semibold text-blue"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-ink">No skills listed.</p>
              )}
            </div>
          </Panel>

          <Panel title="Applications">
            {!candidate.applications?.length && (
              <p className="text-sm text-ink ml-4">No applications yet.</p>
            )}

            <div className="space-y-3">
              {candidate.applications?.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-2xl border border-border p-4 transition hover:border-blue"
                >
                  <div>
                    <h4 className="font-semibold text-navy">{app.job?.title ?? "-"}</h4>
                    <p className="text-sm text-ink">{app.job?.country ?? "-"}</p>
                  </div>
                  <StatusPill status={app.internal_status ?? app.status} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Panel title="Documents">
            <DocumentChecklistCard documents={candidate.documents ?? []} />
          </Panel>

          <Panel title="Actions">
            <div className="space-y-3">
              {candidate.resume?.public_url && (
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a
                    href={candidate.resume.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    Download Resume
                    <Download size={16} className="ml-2" />
                  </a>
                </Button>
              )}
              <Button className="w-full rounded-full bg-navy hover:bg-blue" onClick={activate}>
                Activate Candidate
              </Button>
              <Button variant="destructive" className="w-full rounded-full" onClick={suspend}>
                Suspend Candidate
              </Button>
            </div>
          </Panel>

          <Panel title="Recruitment Status">
            <div className="space-y-4">
              <Status title="Application" />
              <Status title="Interview" />
              <Status title="Medical" />
              <Status title="Visa" />
              <Status title="Deployment" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-blue-wash/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-blue">{label}</p>
      <h4 className="mt-1.5 font-semibold text-navy">{value || "-"}</h4>
    </div>
  );
}

function Status({ title }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Circle className="h-4 w-4 text-blue-soft" />
        <span className="text-sm text-navy">{title}</span>
      </div>
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
        Pending
      </span>
    </div>
  );
}

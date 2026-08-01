import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getRequirement,
  approveRequirement,
  rejectRequirement,
  requestClarification,
  convertRequirement,
} from "@/lib/admin/api";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DotGrid } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/requirements/$id")({
  component: RequirementDetails,
});

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  converted: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  clarification: "bg-amber-50 text-amber-700",
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

function RequirementDetails() {
  const { id } = Route.useParams();

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

  return (
    <div className="relative space-y-6">
      <DotGrid className="right-0 top-0 h-20 w-20 opacity-60" />

      <div className="relative flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue">
            Requirement
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy">{requirement.role}</h1>
          <p className="mt-1 text-ink">{requirement.company_name}</p>
        </div>

        <StatusPill status={requirement.status} />
      </div>

      <div className="relative grid gap-6 lg:grid-cols-3">
        <Panel title="Requirement Information">
          <div className="space-y-3">
            <Info label="Role" value={requirement.role} />
            <Info label="Country" value={requirement.country} />
            <Info label="Sector" value={requirement.sector} />
            <Info label="Headcount" value={requirement.headcount} />
            <Info label="Timeline" value={requirement.timeline} />
            <Info label="Contract Duration" value={requirement.contract_duration} />
            <Info label="Working Hours" value={requirement.working_hours} />
          </div>
        </Panel>

        <Panel title="Compensation & Benefits">
          <div className="space-y-3">
            <Info
              label="Salary Range"
              value={
                requirement.salary_min || requirement.salary_max
                  ? `${requirement.salary_min ?? "-"} - ${requirement.salary_max ?? "-"} ${requirement.currency ?? ""}`
                  : undefined
              }
            />
            <Info label="Accommodation" value={requirement.accommodation ? "Provided" : "Not provided"} />
            <Info label="Transport" value={requirement.transport ? "Provided" : "Not provided"} />
            <Info label="Food" value={requirement.food ? "Provided" : "Not provided"} />
            <Info label="Other Benefits" value={requirement.benefits ?? "—"} />
          </div>
        </Panel>

        <Panel title="Point of Contact">
          <div className="space-y-3">
            <Info label="Submitted By" value={requirement.company_name} />
            <Info label="Submitted On" value={requirement.created_at} />
            <Info label="Contact Person" value={requirement.contact_person} />
            <Info label="Contact Email" value={requirement.contact_email} />
            <Info label="Contact Phone" value={requirement.contact_phone} />
          </div>
        </Panel>
      </div>

      {(requirement.job_description || requirement.qualifications || requirement.message) && (
        <div className="relative grid gap-6 lg:grid-cols-3">
          {requirement.job_description && (
            <Panel title="Job Description">
              <p className="whitespace-pre-wrap text-sm text-ink">{requirement.job_description}</p>
            </Panel>
          )}

          {requirement.qualifications && (
            <Panel title="Required Qualifications">
              <p className="whitespace-pre-wrap text-sm text-ink">{requirement.qualifications}</p>
            </Panel>
          )}

          {requirement.message && (
            <Panel title="Additional Notes">
              <p className="whitespace-pre-wrap text-sm text-ink">{requirement.message}</p>
            </Panel>
          )}
        </div>
      )}

      <div className="relative grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2" />

        <Panel title="Actions">
          <div className="space-y-3">
            <Button className="w-full rounded-full bg-navy hover:bg-blue" onClick={approve}>
              Approve
            </Button>
            <Button
              variant="secondary"
              className="w-full rounded-full bg-blue-wash text-blue hover:bg-blue-soft"
              onClick={clarify}
            >
              Request Clarification
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-border hover:border-blue hover:text-blue"
              onClick={convert}
            >
              Convert to Job Order
            </Button>
            <Button variant="destructive" className="w-full rounded-full" onClick={reject}>
              Reject
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-blue-wash/40 px-4 py-3">
      <span className="text-sm font-medium text-navy">{label}</span>
      <span className="text-sm text-ink">{value ?? "-"}</span>
    </div>
  );
}

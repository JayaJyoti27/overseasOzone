import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getJobOrder,
  startAdminReview,
  requestJobOrderClarification,
  sendForEmployerApproval,
  startLegalization,
  approveForRecruitment,
  openRecruitment,
  closeRecruitment,
} from "@/lib/admin/api";
import {
  statusLabel,
  statusStyle,
  getAvailableActions,
  TIMELINE_STAGES,
  type JobOrderAction,
} from "@/lib/admin/jobOrderStatus";
import { JobOrderTimeline } from "@/components/Admin/JobOrders/JobOrderTimeline";
import { LegalizationChecklist } from "@/components/Admin/JobOrders/LegalizationChecklist";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { DotGrid } from "@/components/site/decor";

export const Route = createFileRoute("/Admin/job-orders/$id")({
  component: JobOrderDetails,
});

function StatusPill({ status }: { status?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyle(
        status,
      )}`}
    >
      {statusLabel(status)}
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

const ACTION_HANDLERS: Record<
  Exclude<JobOrderAction, "requestClarification">,
  (id: string) => Promise<unknown>
> = {
  startAdminReview,
  sendForEmployerApproval,
  startLegalization,
  approveForRecruitment,
  openRecruitment,
  closeRecruitment,
};

function JobOrderDetails() {
  const { id } = Route.useParams();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [clarificationOpen, setClarificationOpen] = useState(false);
  const [clarificationNotes, setClarificationNotes] = useState("");
  const [legalizationComplete, setLegalizationComplete] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getJobOrder(id);
      setJob(data.data ?? data);
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || err?.message || "Failed to load job order.");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: JobOrderAction) {
    if (action === "requestClarification") {
      setClarificationOpen(true);
      return;
    }

    setActionPending(action);
    try {
      await ACTION_HANDLERS[action](id);
      await load();
    } finally {
      setActionPending(null);
    }
  }

  async function submitClarification() {
    setActionPending("requestClarification");
    try {
      await requestJobOrderClarification(id, clarificationNotes);
      setClarificationOpen(false);
      setClarificationNotes("");
      await load();
    } finally {
      setActionPending(null);
    }
  }

  if (!loading && loadError)
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-red-600">{loadError}</p>
        <Button variant="outline" className="rounded-full" onClick={load}>
          Try again
        </Button>
      </div>
    );

  if (loading || !job)
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={32} />
        <p className="text-sm text-ink">Loading job order…</p>
      </div>
    );

  const availableActions = getAvailableActions(job.status);

  const legalizationStageIndex = TIMELINE_STAGES.indexOf("legalization_in_progress");
  const currentStageIndex = TIMELINE_STAGES.indexOf(job.status);
  const showLegalizationChecklist =
    currentStageIndex >= legalizationStageIndex ||
    ["candidate_selected", "visa_processing", "deployment_completed"].includes(job.status);

  return (
    <div className="relative space-y-6">
      <DotGrid className="right-0 top-0 h-20 w-20 opacity-60" />

      <div className="relative flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue">
            Job Order
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy">{job.title}</h1>
          <p className="mt-1 text-ink">{job.employer?.company_name}</p>
        </div>

        <StatusPill status={job.status} />
      </div>

      <JobOrderTimeline status={job.status} />

      <div className="relative grid gap-6 lg:grid-cols-3">
        <Panel title="Job Information">
          <div className="space-y-3">
            <Info label="Title" value={job.title} />
            <Info label="Category" value={job.category} />
            <Info label="Country" value={job.country} />
            <Info label="Vacancies" value={job.vacancies} />
            <Info label="Contract Duration" value={job.contract_duration} />
          </div>
        </Panel>

        <Panel title="Employer">
          <div className="space-y-3">
            <Info label="Company" value={job.employer?.company_name} />
            <Info label="Contact Person" value={job.employer?.contact_person} />
            <Info label="Email" value={job.employer?.email} />
          </div>
        </Panel>

        <Panel title="Actions">
          <div className="space-y-3">
            {availableActions.length === 0 ? (
              <p className="text-sm text-ink">
                No admin actions are available while this job order is in the{" "}
                <span className="font-medium text-navy">{statusLabel(job.status)}</span> status.
              </p>
            ) : (
              availableActions.map((a) => {
                const blockedByLegalization =
                  a.action === "approveForRecruitment" && !legalizationComplete;

                return (
                  <div key={a.action}>
                    <Button
                      variant={a.variant === "destructive" ? "destructive" : "default"}
                      className={`w-full rounded-full ${
                        a.variant === "secondary"
                          ? "border border-border bg-white text-navy hover:bg-blue-wash"
                          : a.variant !== "destructive"
                            ? "bg-navy hover:bg-blue"
                            : ""
                      }`}
                      disabled={actionPending !== null || blockedByLegalization}
                      onClick={() => runAction(a.action)}
                    >
                      {actionPending === a.action ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        a.label
                      )}
                    </Button>
                    {blockedByLegalization && (
                      <p className="mt-1.5 text-xs text-ink">
                        Blocked until every required legalization document is attested.
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>

      {showLegalizationChecklist && (
        <Panel title="Legalization Checklist">
          <LegalizationChecklist jobOrderId={job.id} onCompletenessChange={setLegalizationComplete} />
        </Panel>
      )}

      <Panel title="Assigned Candidates">
        {!job.candidates?.length ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <p className="text-sm text-ink">No candidates assigned.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {job.candidates.map((candidate: any) => (
              <div
                key={candidate.applicationId ?? candidate.id}
                className="flex items-center justify-between rounded-2xl border border-border p-4 transition hover:border-blue"
              >
                <div>
                  <h4 className="font-semibold text-navy">{candidate.name ?? "-"}</h4>
                  <p className="text-sm text-ink">{candidate.phone ?? candidate.email ?? "-"}</p>
                </div>

                <div className="flex items-center gap-3">
                  {candidate.resume_url ? (
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue hover:underline"
                    >
                      View CV
                    </a>
                  ) : (
                    <span className="text-xs text-ink/60">No CV</span>
                  )}
                  <StatusPill status={candidate.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Dialog open={clarificationOpen} onOpenChange={setClarificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Employer Clarification</DialogTitle>
            <DialogDescription>
              Explain what the employer needs to clarify or correct. This note is saved to the job
              order and shown to the employer.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={clarificationNotes}
            onChange={(e) => setClarificationNotes(e.target.value)}
            placeholder="e.g. Please confirm the accommodation arrangement for this role."
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setClarificationOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitClarification}
              disabled={!clarificationNotes.trim() || actionPending === "requestClarification"}
            >
              {actionPending === "requestClarification" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getRequirement } from "@/lib/employer/api";
import { requirementStatusLabel, requirementStatusStyle } from "@/lib/employer/requirementStatus";
import { statusLabel, statusStyle, TIMELINE_STAGES } from "@/lib/admin/jobOrderStatus";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { RequirementEditForm } from "@/components/Employer/JobOrders/RequirementEditForm";
import { LegalizationDocumentsCard } from "@/components/Employer/JobOrders/Details/LegalizationDocumentsCard";

export const Route = createFileRoute("/Employer/job-orders/$jobId")({
  component: JobOrderDetailsPage,
});

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value ?? "-"}</span>
    </div>
  );
}

function JobOrderDetailsPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    load();
  }, [jobId]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const data = await getRequirement(jobId);
      setDetails(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? "Unable to load this requirement.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm text-muted-foreground">Loading requirement…</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-sm text-red-600">
        {error ?? "Requirement not found."}
      </div>
    );
  }

  const { requirement, timeline, convertedJobOrder, recruitment, recentCandidates } = details;

  const legalizationStageIndex = TIMELINE_STAGES.indexOf("legalization_in_progress");
  const currentStageIndex = convertedJobOrder
    ? TIMELINE_STAGES.indexOf(convertedJobOrder.status)
    : -1;
  const showLegalizationDocuments =
    !!convertedJobOrder &&
    (currentStageIndex >= legalizationStageIndex ||
      ["candidate_selected", "visa_processing", "deployment_completed"].includes(
        convertedJobOrder.status,
      ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Requirement
          </span>
          <h1 className="mt-1 text-3xl font-bold">{requirement.role}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{requirement.id}</p>
        </div>

        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${requirementStatusStyle(
            requirement.status,
          )}`}
        >
          {requirementStatusLabel(requirement.status)}
        </span>
      </div>

      {/* Clarification banner - the one thing that needs the employer's attention */}
      {requirement.status === "clarification_required" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
            <p className="text-sm font-semibold text-orange-800">Admin requested clarification</p>
            <p className="mt-1 text-sm text-orange-700">
              {requirement.clarification_notes || "Please review and update this requirement."}
            </p>

            {!editing && (
              <Button size="sm" className="mt-3" onClick={() => setEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit &amp; Resubmit
              </Button>
            )}
          </div>

          {editing && (
            <RequirementEditForm
              requirement={requirement}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                load();
              }}
            />
          )}
        </div>
      )}

      {/* Requirement-stage timeline (backend-computed) */}
      <Panel title="Review Progress">
        <div className="flex justify-between">
          {timeline.map((stage: any) => (
            <div key={stage.key} className="flex flex-1 flex-col items-center">
              <div
                className={`h-5 w-5 rounded-full ${stage.completed ? "bg-green-600" : "bg-muted"}`}
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">{stage.label}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Once converted, show the job order's own further-along status */}
      {convertedJobOrder && (
        <Panel title="Job Order Status">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              This requirement was converted to job order{" "}
              <span className="font-medium">{convertedJobOrder.id}</span>.
            </p>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyle(
                convertedJobOrder.status,
              )}`}
            >
              {statusLabel(convertedJobOrder.status)}
            </span>
          </div>

          {convertedJobOrder.status === "clarification_required" && (
            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
              <p className="text-sm font-semibold text-orange-800">Admin requested clarification</p>
              <p className="mt-1 text-sm text-orange-700">
                {convertedJobOrder.remarks || "Please review and update this job order."}
              </p>
            </div>
          )}
        </Panel>
      )}

      {showLegalizationDocuments && (
        <Panel title="Legalization Documents">
          <LegalizationDocumentsCard jobOrderId={convertedJobOrder.id} />
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Position Details">
          <div className="space-y-3">
            <Info label="Role" value={requirement.role} />
            <Info label="Country" value={requirement.country} />
            <Info label="Sector" value={requirement.sector} />
            <Info label="Vacancies" value={requirement.headcount} />
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
            <Info label="Other Benefits" value={requirement.benefits} />
          </div>
        </Panel>

        <Panel title="Point of Contact">
          <div className="space-y-3">
            <Info label="Company" value={requirement.company_name} />
            <Info
              label="Submitted On"
              value={
                requirement.created_at
                  ? new Date(requirement.created_at).toLocaleDateString()
                  : "-"
              }
            />
            <Info label="Contact Person" value={requirement.contact_person} />
            <Info label="Contact Email" value={requirement.contact_email} />
            <Info label="Contact Phone" value={requirement.contact_phone} />
          </div>
        </Panel>
      </div>

      {(requirement.job_description || requirement.qualifications || requirement.message) && (
        <div className="grid gap-6 lg:grid-cols-3">
          {requirement.job_description && (
            <Panel title="Job Description">
              <p className="whitespace-pre-wrap text-sm">{requirement.job_description}</p>
            </Panel>
          )}
          {requirement.qualifications && (
            <Panel title="Required Qualifications">
              <p className="whitespace-pre-wrap text-sm">{requirement.qualifications}</p>
            </Panel>
          )}
          {requirement.message && (
            <Panel title="Additional Notes">
              <p className="whitespace-pre-wrap text-sm">{requirement.message}</p>
            </Panel>
          )}
        </div>
      )}

      {/* Recruitment summary + candidates - only meaningful once converted to a job order */}
      {convertedJobOrder && (
        <>
          <Panel title="Recruitment Summary">
            <div className="grid grid-cols-5 gap-4 text-center">
              <SummaryStat label="Applications" value={recruitment.applications} />
              <SummaryStat label="Shortlisted" value={recruitment.shortlisted} />
              <SummaryStat label="Interviews" value={recruitment.interviews} />
              <SummaryStat label="Offers" value={recruitment.offers} />
              <SummaryStat label="Deployed" value={recruitment.deployed} />
            </div>
          </Panel>

          <Panel title="Candidates">
            {!recentCandidates?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No candidates yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCandidates.map((application: any) => (
                    <TableRow
                      key={application.id}
                      onClick={() =>
                        application.candidate?.id &&
                        navigate({
                          to: "/Employer/candidates/$candidateId",
                          params: { candidateId: application.candidate.id },
                        })
                      }
                      className={application.candidate?.id ? "cursor-pointer hover:bg-muted/50" : undefined}
                    >
                      <TableCell>{application.candidate?.full_name ?? "-"}</TableCell>
                      <TableCell>{application.candidate?.nationality ?? "-"}</TableCell>
                      <TableCell className="capitalize">
                        {(application.internal_status ?? application.status ?? "-").replace(
                          /_/g,
                          " ",
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted/40 px-3 py-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

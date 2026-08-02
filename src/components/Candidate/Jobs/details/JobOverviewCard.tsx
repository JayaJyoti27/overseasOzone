import { Briefcase, Building2, Globe, Clock, DollarSign, Home, Bus, Utensils } from "lucide-react";

import { Card } from "@/components/ui/card";

import { formatJobSalary } from "@/lib/candidate/formatJobSalary";
import type { CandidateJob } from "@/lib/candidate/types";

interface Props {
  job: CandidateJob;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>

        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function BenefitPill({ included, label }: { included?: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        included ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
      }`}
    >
      {label} {included ? "Provided" : "Not provided"}
    </span>
  );
}

export default function JobOverviewCard({ job }: Props) {
  const salary = formatJobSalary(job);
  const jobOrder = job.job_order;

  const workingDays =
    [jobOrder?.working_hours, jobOrder?.contract_duration].filter(Boolean).join(" · ") || null;

  return (
    <Card className="rounded-2xl p-6">
      <h2 className="mb-2 text-2xl font-semibold">Position Details</h2>

      <div className="divide-y">
        <DetailRow icon={Briefcase} label="Role" value={job.title} />
        <DetailRow icon={Building2} label="Company" value={job.company} />
        <DetailRow
          icon={Globe}
          label="Country"
          value={job.country ? `${job.country}${job.city ? `, ${job.city}` : ""}` : null}
        />
        <DetailRow icon={Briefcase} label="Sector" value={job.sector} />
        <DetailRow icon={Clock} label="Working Days / Hours" value={workingDays} />
      </div>

      <h2 className="mb-3 mt-8 text-2xl font-semibold">Compensation &amp; Benefits</h2>

      <div className="divide-y">
        <DetailRow icon={DollarSign} label="Salary Range" value={salary} />
      </div>

      {jobOrder && (
        <div className="mt-4 flex flex-wrap gap-2">
          <BenefitPill included={jobOrder.accommodation} label="Accommodation" />
          <BenefitPill included={jobOrder.transport} label="Transport" />
          <BenefitPill included={jobOrder.food} label="Food" />
        </div>
      )}

      {jobOrder?.benefits && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Other Benefits
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm">{jobOrder.benefits}</p>
        </div>
      )}
    </Card>
  );
}

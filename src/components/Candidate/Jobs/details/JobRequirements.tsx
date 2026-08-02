import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";

import type { CandidateJob } from "@/lib/candidate/types";

interface Props {
  job: CandidateJob;
}

export default function JobRequirements({ job }: Props) {
  const qualifications = job.job_order?.requirements || job.experience_required;

  if (!qualifications && !job.license_required) return null;

  return (
    <Card className="rounded-2xl p-6">
      <h2 className="mb-6 text-2xl font-semibold">Required Qualifications</h2>

      <div className="space-y-4">
        {qualifications && (
          <div className="flex gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />

            <span className="whitespace-pre-wrap">{qualifications}</span>
          </div>
        )}

        {job.license_required && (
          <div className="flex gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />

            <span>{job.license_required}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

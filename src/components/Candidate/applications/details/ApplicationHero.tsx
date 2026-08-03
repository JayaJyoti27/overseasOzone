import { Badge } from "@/components/ui/badge";

import { Card } from "@/components/ui/card";

import { Briefcase, Building2, Globe } from "lucide-react";

import type { CandidateApplication } from "@/lib/candidate/types";

interface Props {
  application: CandidateApplication;
}

export default function ApplicationHero({ application }: Props) {
  return (
    <Card className="rounded-2xl p-8">
      <Badge>{application.status.replaceAll("_", " ")}</Badge>

      <h1 className="mt-5 text-3xl font-bold">{application.job?.title ?? "Job listing"}</h1>

      <div className="mt-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />

          {application.job?.company ?? "—"}
        </div>

        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />

          {application.job?.country ?? "—"}
        </div>

        {application.job?.sector && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />

            {application.job.sector}
          </div>
        )}
      </div>
    </Card>
  );
}

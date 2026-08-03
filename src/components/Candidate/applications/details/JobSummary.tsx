import { Card } from "@/components/ui/card";

import type { CandidateApplication } from "@/lib/candidate/types";

interface Props {
  application: CandidateApplication;
}

export default function JobSummary({ application }: Props) {
  return (
    <Card className="rounded-2xl p-6">
      <h2 className="mb-5 text-xl font-semibold">Job Summary</h2>

      <p>{application.job?.description ?? "No description available."}</p>
    </Card>
  );
}

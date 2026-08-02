import { Link } from "@tanstack/react-router";

import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useJobs } from "@/lib/candidate/hooks";
import type { CandidateJob } from "@/lib/candidate/types";

export default function SimilarJobs() {
  const { data } = useJobs();

  const jobs = data as CandidateJob[] | undefined;

  if (!jobs?.length) return null;

  return (
    <Card className="rounded-2xl p-6">
      <h2 className="mb-6 text-xl font-semibold">Similar Jobs</h2>

      <div className="space-y-4">
        {jobs.slice(0, 4).map((job) => (
          <div key={job.id} className="rounded-xl border p-4">
            <h3 className="font-semibold">{job.title}</h3>

            <p className="text-sm text-muted-foreground">{job.company}</p>

            <Button variant="link" asChild className="mt-2 p-0">
              <Link to="/Candidates/jobs/$id" params={{ id: job.id }}>
                View Job
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

import { SearchX } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { CandidateJob } from "@/lib/candidate/types";

import JobCard from "./JobCard";

interface Props {
  jobs?: CandidateJob[];
  isLoading: boolean;
  totalCount: number;
}

export default function JobList({ jobs, isLoading, totalCount }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-5">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="h-40 animate-pulse rounded-2xl border-none bg-blue-wash/60" />
        ))}
      </div>
    );
  }

  if (!totalCount) {
    return (
      <Card className="flex flex-col items-center gap-2 rounded-2xl border-none p-12 text-center shadow-card">
        <SearchX className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium text-navy">No jobs available right now</p>
        <p className="text-sm text-muted-foreground">Check back soon for new openings.</p>
      </Card>
    );
  }

  if (!jobs?.length) {
    return (
      <Card className="flex flex-col items-center gap-2 rounded-2xl border-none p-12 text-center shadow-card">
        <SearchX className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium text-navy">No jobs match your filters</p>
        <p className="text-sm text-muted-foreground">
          Try a different search term or clear a filter.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {jobs.length} job{jobs.length === 1 ? "" : "s"} found
      </p>

      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

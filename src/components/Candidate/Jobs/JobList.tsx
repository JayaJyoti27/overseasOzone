import { useJobs } from "@/lib/candidate/hooks";

import JobCard from "./JobCard";

interface Props {
  filters: { search?: string; country?: string; category?: string };
}

export default function JobList({ filters }: Props) {
  const { data, isLoading } = useJobs(filters);

  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border p-12 text-center text-muted-foreground">
        No jobs match your search.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

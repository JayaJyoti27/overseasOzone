import { useState } from "react";

import { Link, useNavigate } from "@tanstack/react-router";

import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Globe,
  DollarSign,
  ArrowRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { useApply, useRemoveSavedJob, useSaveJob } from "@/lib/candidate/hooks";
import { formatJobSalary } from "@/lib/candidate/formatJobSalary";
import type { CandidateJob } from "@/lib/candidate/types";

interface Props {
  job: CandidateJob;
}

export default function JobCard({ job }: Props) {
  const navigate = useNavigate();

  const save = useSaveJob();

  const remove = useRemoveSavedJob();

  const apply = useApply();

  const [saved, setSaved] = useState(job.saved);

  const salary = formatJobSalary(job);

  function openDetails() {
    navigate({ to: "/Candidates/jobs/$id", params: { id: job.id } });
  }

  async function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();

    if (saved) {
      await remove.mutateAsync(job.id);

      setSaved(false);
    } else {
      await save.mutateAsync(job.id);

      setSaved(true);
    }
  }

  async function handleApply(e: React.MouseEvent) {
    e.stopPropagation();

    await apply.mutateAsync(job.id);
  }

  return (
    <Card
      onClick={openDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && openDetails()}
      className="cursor-pointer rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{job.title}</h2>

            {job.applied && <Badge>Applied</Badge>}
          </div>

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
            {job.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />

                {job.company}
              </div>
            )}

            {job.country && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />

                {job.country}
                {job.city ? `, ${job.city}` : ""}
              </div>
            )}

            {salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {salary}
              </div>
            )}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleSave}>
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>
      </div>

      {job.sector && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="secondary">{job.sector}</Badge>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button disabled={job.applied} onClick={handleApply}>
          <Briefcase className="mr-2 h-4 w-4" />

          {job.applied ? "Applied" : "Apply"}
        </Button>

        <Button variant="outline" asChild onClick={(e) => e.stopPropagation()}>
          <Link
            to="/Candidates/jobs/$id"
            params={{
              id: job.id,
            }}
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

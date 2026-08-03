import { useState } from "react";

import { Bookmark, BookmarkCheck, Briefcase, Share2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApply, useRemoveSavedJob, useSaveJob } from "@/lib/candidate/hooks";
import type { CandidateJob } from "@/lib/candidate/types";

interface Props {
  job: CandidateJob;
}

export default function JobActions({ job }: Props) {
  const save = useSaveJob();
  const remove = useRemoveSavedJob();
  const apply = useApply();

  const [saved, setSaved] = useState(job.saved);

  async function toggleSave() {
    if (saved) {
      await remove.mutateAsync(job.id);
      setSaved(false);
    } else {
      await save.mutateAsync(job.id);
      setSaved(true);
    }
  }

  async function handleApply() {
    if (!job.id) {
      console.error("JobActions: refusing to apply — job.id is missing.", job);
      return;
    }

    await apply.mutateAsync(job.id);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: job.title,
        text: job.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <Card className="rounded-2xl p-6">
      <Button className="w-full" disabled={job.applied} onClick={handleApply}>
        <Briefcase className="mr-2 h-4 w-4" />
        {job.applied ? "Already Applied" : "Apply Now"}
      </Button>

      <Button variant="outline" className="mt-3 w-full" onClick={toggleSave}>
        {saved ? (
          <>
            <BookmarkCheck className="mr-2 h-4 w-4" />
            Saved
          </>
        ) : (
          <>
            <Bookmark className="mr-2 h-4 w-4" />
            Save Job
          </>
        )}
      </Button>

      <Button variant="outline" className="mt-3 w-full" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share Job
      </Button>
    </Card>
  );
}

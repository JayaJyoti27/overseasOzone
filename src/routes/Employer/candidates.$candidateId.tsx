import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { CandidateHeader } from "@/components/Employer/Candidate/Details/CandidateHeader";
import { CandidateProfileCard } from "@/components/Employer/Candidate/Details/CandidateProfileCard";
import { CandidateDocumentsCard } from "@/components/Employer/Candidate/Details/CandidateDocumentsCard";
import { InterviewCard } from "@/components/Employer/Candidate/InterviewCard";
import { ScheduleInterviewDialog } from "@/components/Employer/Candidate/ScheduleInterviewDialog";
import { CompleteInterviewDialog } from "@/components/Employer/Candidate/CompleteInterviewDialog";
import { IssueOfferLetterButton } from "@/components/Employer/Candidate/IssueOfferLetterButton";
import { ApproveDocumentsButton } from "@/components/Employer/Candidate/ApproveDocumentsButton";
import { getCandidate } from "@/lib/employer/api";

export const Route = createFileRoute("/Employer/candidates/$candidateId")({
  component: CandidateDetailsPage,
});

function CandidateDetailsPage() {
  const { candidateId } = Route.useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    load();
  }, [candidateId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await getCandidate(candidateId);
      setData(result);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to load this candidate.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-muted-foreground">{error ?? "Candidate not found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CandidateHeader candidate={data.candidate} application={data.application} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CandidateProfileCard candidate={data.candidate} application={data.application} />
          <CandidateDocumentsCard documents={data.documents} />
        </div>

        <div className="space-y-6">
          <InterviewCard interview={toInterviewCardShape(data.interview)} />

          {data.application?.internal_status === "employer_shortlisted" && !data.interview && (
            <ScheduleInterviewDialog candidateId={candidateId} onScheduled={load} />
          )}

          {data.application?.internal_status === "interview_scheduled" &&
            data.interview?.status !== "completed" && (
              <CompleteInterviewDialog candidateId={candidateId} onCompleted={load} />
            )}

          {data.application?.internal_status === "selected" && (
            <IssueOfferLetterButton candidateId={candidateId} onIssued={load} />
          )}

          {data.application?.internal_status === "documents_verification" && (
            <ApproveDocumentsButton candidateId={candidateId} onApproved={load} />
          )}
        </div>
      </div>
    </div>
  );
}

function toInterviewCardShape(interview: any) {
  if (!interview) return null;

  const when = interview.interview_date ? new Date(interview.interview_date) : null;

  return {
    date: when ? when.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "TBD",
    time: when ? when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "TBD",
    mode: interview.mode ?? "—",
    meeting_link: interview.meeting_link ?? null,
  };
}

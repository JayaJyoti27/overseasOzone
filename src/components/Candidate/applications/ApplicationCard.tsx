import { Link, useNavigate } from "@tanstack/react-router";

import { ArrowRight, Briefcase, CalendarDays, Globe, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useWithdrawApplication } from "@/lib/candidate/hooks";

import type { CandidateApplication } from "@/lib/candidate/types";

interface Props {
  application: CandidateApplication;
}

function badgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "selected":
    case "offer_sent":
    case "medical":
    case "visa":
    case "deployment":
      return "default";

    case "interview_scheduled":
    case "under_review":
      return "secondary";

    case "rejected":
    case "withdrawn":
      return "destructive";

    default:
      return "outline";
  }
}

function progress(status: string) {
  switch (status) {
    case "applied":
      return 10;

    case "under_review":
      return 25;

    case "shortlisted":
      return 40;

    case "interview_scheduled":
      return 60;

    case "selected":
      return 75;

    case "offer_sent":
      return 85;

    case "medical":
      return 90;

    case "visa":
      return 95;

    case "deployment":
      return 100;

    default:
      return 0;
  }
}

export default function ApplicationCard({ application }: Props) {
  const navigate = useNavigate();
  const withdraw = useWithdrawApplication();

  function openDetails() {
    navigate({ to: "/Candidates/applications/$id", params: { id: application.id } });
  }

  return (
    <Card
      onClick={openDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && openDetails()}
      className="cursor-pointer rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{application.job.title}</h2>

          <div className="mt-3 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />

              {application.job.company}
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />

              {application.job.country}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />

              {new Date(application.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <Badge variant={badgeVariant(application.status)}>
          {application.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Recruitment Progress</span>

          <span>{progress(application.status)}%</span>
        </div>

        <Progress value={progress(application.status)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild onClick={(e) => e.stopPropagation()}>
          <Link
            to="/Candidates/applications/$id"
            params={{
              id: application.id,
            }}
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {application.status !== "withdrawn" && application.status !== "rejected" && (
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              withdraw.mutate(application.id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
        )}
      </div>
    </Card>
  );
}

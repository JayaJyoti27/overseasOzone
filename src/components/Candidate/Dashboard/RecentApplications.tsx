import { Link } from "@tanstack/react-router";
import { Briefcase, CalendarDays, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatDate } from "@/lib/candidate/format";

import { useApplications } from "@/lib/candidate/hooks";

function statusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "selected":
    case "approved":
    case "completed":
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

export default function RecentApplications() {
  const { data, isLoading, isError } = useApplications();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-destructive">Unable to load applications.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>

        <CardContent className="py-16 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

          <h3 className="font-semibold">No Applications Yet</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Browse jobs and submit your first application.
          </p>

          <Button asChild className="mt-6">
            <Link to="/Candidates/jobs">Browse Jobs</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Applications</CardTitle>

        <Button variant="ghost" asChild>
          <Link to="/Candidates/applications">View All</Link>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 5).map((application: any) => (
            <Link
              key={application.id}
              to="/Candidates/applications/$id"
              params={{
                id: application.id,
              }}
            >
              <div className="group flex items-center justify-between rounded-xl border p-5 transition hover:border-primary hover:bg-muted/40">
                <div>
                  <h3 className="font-semibold">{application.job?.title ?? "Job listing"}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.job?.company ?? "—"}
                  </p>

                  <div className="mt-3 flex items-center gap-4">
                    <Badge variant={statusVariant(application.status)}>
                      {application.status.replaceAll("_", " ")}
                    </Badge>

                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />

                      {formatDate(application.applied_at ?? application.created_at)}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

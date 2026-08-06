import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, ArrowRight, Video, Phone, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UpcomingInterview {
  id: string;
  interview_date?: string;
  mode?: string;
  status?: string;
  job_orders?: { title?: string } | null;
  application?: { candidate?: { name?: string } | null } | null;
}

const MODE_ICON: Record<string, typeof Video> = {
  online: Video,
  phone: Phone,
  offline: MapPin,
};

export function UpcomingInterviews({ interviews = [] }: { interviews?: UpcomingInterview[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Upcoming Interviews</CardTitle>

        <Button asChild variant="ghost" size="sm" className="text-blue hover:text-blue">
          <Link to="/Employer/interviews" className="flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {interviews.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-wash">
              <CalendarDays className="h-5 w-5 text-blue" />
            </div>
            <p className="text-sm text-muted-foreground">No interviews scheduled yet.</p>
          </div>
        )}

        {interviews.length > 0 && (
          <div className="divide-y divide-border">
            {interviews.map((item) => {
              const ModeIcon = MODE_ICON[item.mode ?? ""] ?? Video;
              const date = item.interview_date ? new Date(item.interview_date) : null;

              return (
                <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-wash text-blue">
                    <ModeIcon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy">
                      {item.application?.candidate?.name ?? "Candidate"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.job_orders?.title ?? "Job order"}
                    </p>

                    {date && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {date.toLocaleDateString()} ·{" "}
                        {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

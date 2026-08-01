import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTimelineStages } from "@/lib/admin/jobOrderStatus";

interface JobOrderTimelineProps {
  status?: string | null;
}

export function JobOrderTimeline({ status }: JobOrderTimelineProps) {
  const stages = getTimelineStages(status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Progress</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-start justify-between overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <div key={stage.status} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={`h-0.5 flex-1 ${
                    index === 0
                      ? "invisible"
                      : stage.state === "upcoming"
                        ? "bg-border"
                        : "bg-emerald-500"
                  }`}
                />
                <div
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
                    stage.state === "complete"
                      ? "bg-emerald-500 text-white"
                      : stage.state === "current"
                        ? "bg-blue text-white"
                        : "bg-muted text-ink"
                  }`}
                >
                  {stage.state === "complete" ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <div
                  className={`h-0.5 flex-1 ${
                    index === stages.length - 1
                      ? "invisible"
                      : stage.state === "complete"
                        ? "bg-emerald-500"
                        : "bg-border"
                  }`}
                />
              </div>

              <p
                className={`mt-2 max-w-[90px] text-center text-[11px] leading-tight ${
                  stage.state === "current" ? "font-semibold text-navy" : "text-ink"
                }`}
              >
                {stage.label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

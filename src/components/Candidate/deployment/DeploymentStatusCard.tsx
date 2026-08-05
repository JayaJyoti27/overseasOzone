import { Plane, CalendarDays, MapPin } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useDeployments } from "@/lib/candidate/hooks";

export default function DeploymentStatusCard() {
  const { data } = useDeployments();

  const deployment = data?.[0];

  if (!deployment) {
    return <Card className="rounded-2xl p-10 text-center">Deployment has not been scheduled.</Card>;
  }

  return (
    <Card className="rounded-2xl p-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment</h2>

          <p className="text-muted-foreground">Overseas travel status</p>
        </div>

        <Badge>{deployment.status}</Badge>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5" />

          {deployment.flight_number ?? "-"}
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />

          {deployment.departure_time ? new Date(deployment.departure_time).toLocaleString() : "-"}
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />

          {deployment.arrival_airport ?? "-"}
        </div>
      </div>
    </Card>
  );
}

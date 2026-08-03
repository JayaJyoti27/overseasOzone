import { CalendarDays, CircleCheckBig, CircleX, Clock3, FileText, HeartPulse } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Link } from "@tanstack/react-router";

import { useMedicals } from "@/lib/candidate/hooks";

function getBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "fit":
      return "default";

    case "unfit":
      return "destructive";

    case "scheduled":
      return "secondary";

    case "retest_required":
      return "outline";

    default:
      return "outline";
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "fit":
      return <CircleCheckBig className="h-5 w-5 text-green-600" />;

    case "unfit":
      return <CircleX className="h-5 w-5 text-red-600" />;

    default:
      return <HeartPulse className="h-5 w-5 text-primary" />;
  }
}

export default function MedicalCard() {
  const { data, isLoading, isError } = useMedicals();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-destructive">Unable to load medical status.</p>
        </CardContent>
      </Card>
    );
  }

  const medical = data?.[0];

  if (!medical) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical</CardTitle>
        </CardHeader>

        <CardContent className="py-12 text-center">
          <HeartPulse className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

          <h3 className="font-semibold">No Medical Assigned</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Medical information will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medical</CardTitle>

        <Badge variant={getBadgeVariant(medical.status)}>
          {medical.status.replaceAll("_", " ")}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(medical.status)}

          <span className="font-medium">{medical.status.replaceAll("_", " ")}</span>
        </div>

        {medical.hospital_name && (
          <div className="flex items-center gap-3">
            <HeartPulse className="h-4 w-4 text-primary" />

            <span>{medical.hospital_name}</span>
          </div>
        )}

        {medical.appointment_date && (
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-primary" />

            <span>{new Date(medical.appointment_date).toLocaleDateString()}</span>
          </div>
        )}

        {medical.doctor_name && (
          <div className="flex items-center gap-3">
            <Clock3 className="h-4 w-4 text-primary" />

            <span>{medical.doctor_name}</span>
          </div>
        )}

        {medical.report_document_id && (
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-primary" />

            <span>Medical Report Available</span>
          </div>
        )}

        <Button className="mt-2 w-full" asChild>
          <Link to="/Candidates/medical">View Medical</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

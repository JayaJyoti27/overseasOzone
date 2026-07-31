import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import VisaCard from "./components/VisaCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MedicalCard from "./components/MedicalCard";
import { Badge } from "@/components/ui/badge";
import DocumentsCard from "./components/DocumentsCard";
import { getApplication, getTimeline } from "@/lib/recruitment/api";
import InterviewCard from "./components/InterviewCard";
import DeploymentCard from "./components/DeploymentCard";
export const Route = createFileRoute("/Admin/applications/$id")({
  component: ApplicationDetails,
});

function ApplicationDetails() {
  const { id } = Route.useParams();

  const [loading, setLoading] = useState(true);

  const [application, setApplication] = useState<any>(null);

  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);

    try {
      const [applicationData, timelineData] = await Promise.all([
        getApplication(id),
        getTimeline(id),
      ]);

      setApplication(applicationData);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{application.candidate?.name}</h1>

        <p className="text-muted-foreground">{application.job_order?.title}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Candidate</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <p>
              <strong>Name:</strong> {application.candidate?.name}
            </p>

            <p>
              <strong>Email:</strong> {application.candidate?.email}
            </p>

            <p>
              <strong>Phone:</strong> {application.candidate?.phone}
            </p>

            <p>
              <strong>Nationality:</strong> {application.candidate?.nationality}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employer</CardTitle>
          </CardHeader>

          <CardContent>
            <p>
              <strong>Company:</strong> {application.employer?.company_name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Order</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <p>
              <strong>Role:</strong> {application.job_order?.title}
            </p>

            <p>
              <strong>Country:</strong> {application.job_order?.country}
            </p>

            <p>
              <strong>Status:</strong> {application.job_order?.status}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recruitment Status</CardTitle>
        </CardHeader>

        <CardContent>
          <Badge>{application.internal_status}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recruitment Timeline</CardTitle>
        </CardHeader>

        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-muted-foreground">No timeline available.</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((item: any) => (
                <div key={item.id} className="border-l-2 pl-4">
                  <p className="font-medium">{item.title}</p>

                  <p className="text-sm text-muted-foreground">{item.description}</p>

                  <p className="text-xs text-muted-foreground">{item.created_at}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <InterviewCard applicationId={application.id} />
        <DocumentsCard applicationId={application.id} />
        <MedicalCard applicationId={application.id} />
        <VisaCard applicationId={application.id} />
        <DeploymentCard applicationId={application.id} />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { getDeployments } from "@/lib/employer/api";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface Deployment {
  id: string;
  status: string;
  airline_name?: string | null;
  flight_number?: string | null;
  departure_time?: string | null;
  arrival_time?: string | null;
  application?: {
    candidate?: { full_name?: string } | null;
  } | null;
  job?: { title?: string; country?: string } | null;
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function DeploymentTable() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getDeployments();
        setDeployments(result?.deployments ?? []);
      } catch (err) {
        console.error("Failed to load deployments", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deployment Pipeline</CardTitle>
        </CardHeader>

        <CardContent>Loading deployments...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Pipeline</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Flight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {deployments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No Deployments Found
                </TableCell>
              </TableRow>
            ) : (
              deployments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.application?.candidate?.full_name ?? "-"}
                  </TableCell>

                  <TableCell>{item.job?.title ?? "-"}</TableCell>

                  <TableCell>{item.job?.country ?? "-"}</TableCell>

                  <TableCell>{item.flight_number ?? "-"}</TableCell>

                  <TableCell>{formatStatus(item.status)}</TableCell>

                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to="/Employer/deployment/$deploymentId"
                        params={{ deploymentId: item.id }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

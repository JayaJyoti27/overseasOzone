import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Briefcase, MapPin, Users, Loader2, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getRequirements } from "@/lib/employer/api";
import { requirementStatusLabel, requirementStatusStyle } from "@/lib/employer/requirementStatus";

type Requirement = {
  id: string;
  role: string;
  country: string;
  headcount: number;
  status: string;
  created_at?: string;
};

export function RecentJobOrders() {
  const [jobOrders, setJobOrders] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getRequirements({ limit: 5 });
        if (!cancelled) setJobOrders((data ?? []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load recent job orders:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Job Orders</CardTitle>

        <Button asChild variant="ghost" size="sm" className="text-blue hover:text-blue">
          <Link to="/Employer/job-orders" className="flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue" />
            <p className="text-sm text-muted-foreground">Loading job orders…</p>
          </div>
        )}

        {!loading && jobOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-wash">
              <Briefcase className="h-5 w-5 text-blue" />
            </div>
            <p className="text-sm text-muted-foreground">
              No job orders yet. Create one to start recruiting.
            </p>
            <Button asChild size="sm">
              <Link to="/Employer/job-orders/new">Create Job Order</Link>
            </Button>
          </div>
        )}

        {!loading && jobOrders.length > 0 && (
          <div className="divide-y divide-border">
            {jobOrders.map((job) => (
              <Link
                key={job.id}
                to="/Employer/job-orders/$jobId"
                params={{ jobId: job.id }}
                className="flex items-center justify-between gap-4 py-3 transition first:pt-0 last:pb-0 hover:opacity-80"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium capitalize text-navy">{job.role}</p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {job.headcount} vacancies
                    </span>
                    {job.created_at && (
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${requirementStatusStyle(
                    job.status,
                  )}`}
                >
                  {requirementStatusLabel(job.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

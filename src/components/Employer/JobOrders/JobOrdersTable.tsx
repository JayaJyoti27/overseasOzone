import { useEffect, useState } from "react";
import { Eye, Briefcase, MapPin, Users, Plus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

export function JobOrdersTable() {
  const navigate = useNavigate();

  const [jobOrders, setJobOrders] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRequirements();
        setJobOrders(data ?? []);
      } catch (err) {
        console.error("Failed to load job orders", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-white py-20 shadow-card">
        <Loader2 className="animate-spin text-blue" size={28} />
        <p className="text-sm text-ink">Loading job orders…</p>
      </div>
    );
  }

  if (jobOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-white py-20 text-center shadow-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-wash">
          <Briefcase className="text-blue" size={24} />
        </div>
        <h3 className="font-display text-lg font-semibold text-navy">No job orders yet</h3>
        <p className="max-w-sm text-sm text-ink">
          Submit your first requirement and it'll show up here so you can track its progress.
        </p>
        <Button
          className="mt-2 rounded-full bg-navy px-5 hover:bg-blue"
          onClick={() =>
            navigate({
              to: "/Employer/job-orders/new",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Job Order
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
      {/* Header row */}
      <div className="grid grid-cols-[1.1fr_1.6fr_1.2fr_0.9fr_1.4fr_1.1fr_0.9fr] gap-4 border-b border-border bg-blue-wash/40 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-blue">
        <span>ID</span>
        <span>Position</span>
        <span>Country</span>
        <span>Vacancies</span>
        <span>Status</span>
        <span>Submitted</span>
        <span className="text-right">Action</span>
      </div>

      {/* Rows */}
      <div>
        {jobOrders.map((job) => (
          <div
            key={job.id}
            className="grid grid-cols-[1.1fr_1.6fr_1.2fr_0.9fr_1.4fr_1.1fr_0.9fr] items-center gap-4 border-b border-border px-6 py-4 transition last:border-b-0 hover:bg-blue-wash/30"
          >
            <span className="truncate font-mono text-xs text-muted-foreground">
              {job.id.slice(0, 8)}
            </span>

            <span className="truncate font-medium capitalize text-navy">{job.role}</span>

            <span className="flex items-center gap-1.5 truncate text-sm text-ink">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {job.country}
            </span>

            <span className="flex items-center gap-1.5 text-sm text-ink">
              <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {job.headcount}
            </span>

            <span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${requirementStatusStyle(
                  job.status,
                )}`}
              >
                {requirementStatusLabel(job.status)}
              </span>
            </span>

            <span className="text-sm text-muted-foreground">
              {job.created_at ? new Date(job.created_at).toLocaleDateString() : "-"}
            </span>

            <span className="text-right">
              <Link to="/Employer/job-orders/$jobId" params={{ jobId: job.id }}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-border hover:border-blue hover:bg-blue-wash hover:text-blue"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View
                </Button>
              </Link>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

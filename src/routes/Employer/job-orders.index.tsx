import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { JobOrdersTable } from "@/components/Employer/JobOrders/JobOrdersTable";

export const Route = createFileRoute("/Employer/job-orders/")({
  component: JobOrdersPage,
});

function JobOrdersPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Job Orders</h1>

          <p className="mt-1 text-ink">
            Manage all recruitment requests submitted to Ozone Overseas.
          </p>
        </div>

        <Button
          className="rounded-full bg-navy px-5 hover:bg-blue"
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

      <JobOrdersTable />
    </div>
  );
}

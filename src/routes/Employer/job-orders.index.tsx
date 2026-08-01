import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { JobOrdersTable } from "@/components/Employer/JobOrders/JobOrdersTable";
import { useNavigate } from "@tanstack/react-router";
export const Route = createFileRoute("/Employer/job-orders/")({
  component: JobOrdersPage,
});

function JobOrdersPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Orders</h1>

          <p className="text-muted-foreground">
            Manage all recruitment requests submitted to Ozone Overseas.
          </p>
        </div>
        <Button
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

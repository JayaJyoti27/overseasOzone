import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/Employer/job-orders")({
  component: JobOrdersLayout,
});

function JobOrdersLayout() {
  return <Outlet />;
}

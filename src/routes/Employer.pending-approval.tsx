// src/routes/Employer.pending-approval.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/Employer/pending-approval")({
  component: PendingApproval,
});

function PendingApproval() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-blue" />
        <h1 className="text-2xl font-bold">Your registration is under review</h1>
        <p className="mt-3 text-muted-foreground">
          Our team is verifying your company details. You'll get an email once your account is
          approved and you can access the dashboard.
        </p>
      </div>
    </div>
  );
}

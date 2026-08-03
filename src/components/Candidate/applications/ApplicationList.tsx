import { AlertCircle, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useApplications } from "@/lib/candidate/hooks";

import ApplicationCard from "./ApplicationCard";

export default function ApplicationList() {
  const { data, isLoading, isError, error, refetch } = useApplications();

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const isAuthError = status === 401 || status === 403;

    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />

        <p className="font-medium">
          {isAuthError
            ? "Your session has expired."
            : "Something went wrong loading your applications."}
        </p>

        <p className="text-sm text-muted-foreground">
          {isAuthError
            ? "Please log in again to keep viewing your applications."
            : "Check your connection and try again."}
        </p>

        {isAuthError ? (
          <Button asChild className="mt-2">
            <a href="/candidate">
              <LogIn className="mr-2 h-4 w-4" />
              Log in again
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="mt-2" onClick={() => refetch()}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!data?.length) {
    return <div className="rounded-xl border p-12 text-center">No applications found.</div>;
  }

  return (
    <div className="space-y-5">
      {data.map((application) => (
        <ApplicationCard key={application.id} application={application} />
      ))}
    </div>
  );
}

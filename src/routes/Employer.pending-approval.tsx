// src/routes/Employer.pending-approval.tsx
import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Loader2 } from "lucide-react";
import { getCurrentProfile, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/Employer/pending-approval")({
  component: PendingApproval,
});

// How often we re-check approval_status while the employer sits on this
// page. The route guard (Employer/route.tsx) only re-checks on navigation,
// so without this poll an approved employer would stay stuck here until
// they happened to refresh the tab themselves.
const POLL_INTERVAL_MS = 5000;

function PendingApproval() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const redirectingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const checkApproval = async () => {
      if (redirectingRef.current) return;
      setChecking(true);
      try {
        const profile = await getCurrentProfile();
        if (!profile || cancelled) return;

        const { data: employer } = await supabase
          .from("employers")
          .select("approval_status")
          .eq("id", profile.id)
          .maybeSingle();

        if (!cancelled && employer?.approval_status === "approved") {
          redirectingRef.current = true;
          navigate({ to: "/Employer/dashboard" });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    // Check once immediately (covers the case where the admin approved
    // while this tab was already open and idle), then keep polling.
    checkApproval();
    const interval = setInterval(checkApproval, POLL_INTERVAL_MS);

    // Also re-check the instant the tab regains focus/visibility — covers
    // the common case of the employer switching back after getting the
    // "you're approved" email.
    const onVisible = () => {
      if (document.visibilityState === "visible") checkApproval();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-blue" />
        <h1 className="text-2xl font-bold">Your registration is under review</h1>
        <p className="mt-3 text-muted-foreground">
          Our team is verifying your company details. You'll get an email once your account is
          approved — this page will take you to your dashboard automatically as soon as that
          happens, no need to refresh.
        </p>
        {checking && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Checking approval status…
          </p>
        )}
      </div>
    </div>
  );
}

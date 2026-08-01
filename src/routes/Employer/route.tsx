import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/Employer/Layout/AppShell";
import { getCurrentProfile, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/Employer")({
  beforeLoad: async ({ location }) => {
    const isRegisterPage = location.pathname === "/Employer/register";
    const isPendingPage = location.pathname === "/Employer/pending-approval";

    // Supabase's session lives in the browser (localStorage) and isn't
    // available during SSR. Skip the auth check entirely on the server —
    // the real check runs once this executes client-side.
    if (typeof window === "undefined") {
      return {};
    }

    const profile = await getCurrentProfile();

    if (!profile || profile.role !== "employer") {
      // /register and /pending-approval are only ever reached right after
      // an authenticated action (email verification, form submit). Don't
      // re-litigate "are you logged in" on these two pages — just let them
      // load instead of bouncing to /Login.
      if (isRegisterPage || isPendingPage) {
        return { profile: null };
      }
      throw redirect({ to: "/Login" });
    }

    const { data: employer } = await supabase
      .from("employers")
      .select("company_name, approval_status")
      .eq("id", profile.id)
      .maybeSingle();

    const { data: documents } = await supabase
      .from("employer_documents")
      .select("id")
      .eq("employer_id", profile.id)
      .limit(1);

    const isIncomplete =
      !employer || !employer.company_name || !documents || documents.length === 0;
    console.log("[EmployerGuard]", { employer, documents, isIncomplete });

    if (isIncomplete) {
      if (!isRegisterPage) {
        throw redirect({ to: "/Employer/register" });
      }
      return { profile };
    }

    if (employer.approval_status !== "approved") {
      if (!isPendingPage) {
        throw redirect({ to: "/Employer/pending-approval" });
      }
      return { profile };
    }

    if (isRegisterPage || isPendingPage) {
      throw redirect({ to: "/Employer/dashboard" });
    }

    return { profile };
  },
  component: EmployerLayout,
});

function EmployerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isBarePage = pathname === "/Employer/register" || pathname === "/Employer/pending-approval";

  if (isBarePage) {
    return <Outlet />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

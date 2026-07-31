import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/Employer/Layout/AppShell";
import { getCurrentProfile, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/Employer")({
  beforeLoad: async ({ location }) => {
    const profile = await getCurrentProfile();

    if (!profile || profile.role !== "employer") {
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

    const isRegisterPage = location.pathname === "/Employer/register";
    const isPendingPage = location.pathname === "/Employer/pending-approval";

    const isIncomplete =
      !employer || !employer.company_name || !documents || documents.length === 0;

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

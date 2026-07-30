import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/Employer/Layout/AppShell";
import { getCurrentProfile, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/Employer")({
  beforeLoad: async () => {
    const profile = await getCurrentProfile();

    if (!profile || profile.role !== "employer") {
      throw redirect({ to: "/Login" });
    }

    const { data: employer } = await supabase
      .from("employers")
      .select("approval_status, status")
      .eq("id", profile.id)
      .single();

    if (employer?.approval_status !== "approved") {
      throw redirect({ to: "/Employer/pending-approval" });
    }

    return { profile };
  },
  component: EmployerLayout,
});

function EmployerLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

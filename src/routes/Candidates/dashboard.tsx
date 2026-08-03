import { createFileRoute } from "@tanstack/react-router";

import DashboardStats from "@/components/Candidate/Dashboard/DashboardStats";
import ProfileCompletion from "@/components/Candidate/Dashboard/ProfileCompletion";
import RecentApplications from "@/components/Candidate/Dashboard/RecentApplications";
import UpcomingInterview from "@/components/Candidate/Dashboard/UpcomingInterview";
import MedicalCard from "@/components/Candidate/Dashboard/MedicalCard";
import VisaCard from "@/components/Candidate/Dashboard/VisaCard";
import RecentActivity from "@/components/Candidate/Dashboard/RecentActivity";
import QuickActions from "@/components/Candidate/Dashboard/QuickActions";
import DashboardSkeleton from "@/components/Candidate/Dashboard/DashboardSkeleton";
import WelcomeBanner from "@/components/Candidate/Dashboard/WelcomeBanner";

import { useDashboard } from "@/lib/candidate/hooks";

export const Route = createFileRoute("/Candidates/dashboard")({
  component: CandidateDashboard,
});

function CandidateDashboard() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border p-8">
        <h2 className="text-xl font-semibold">Unable to load dashboard</h2>

        <p className="mt-2 text-muted-foreground">Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.isNewProfile && <WelcomeBanner />}

      <DashboardStats dashboard={data} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <RecentApplications />

          <RecentActivity activity={data.recentActivity} />
        </div>

        <div className="space-y-6">
          <ProfileCompletion completion={data.profileCompletion} sections={data.profileSections} />

          <UpcomingInterview />

          <MedicalCard />

          <VisaCard />

          <QuickActions />
        </div>
      </div>
    </div>
  );
}

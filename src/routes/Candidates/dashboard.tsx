import { createFileRoute } from "@tanstack/react-router";

import DashboardStats from "@/components/Candidate/Dashboard/DashboardStats";
import ProfileCompletion from "@/components/Candidate/Dashboard/ProfileCompletion";
import RecentApplications from "@/components/Candidate/Dashboard/RecentApplications";
import UpcomingInterview from "@/components/Candidate/Dashboard/UpcomingInterview";
import MedicalCard from "@/components/Candidate/Dashboard/MedicalCard";
import VisaCard from "@/components/Candidate/Dashboard/VisaCard";
import RecentActivity from "@/components/Candidate/Dashboard/RecentActivity";
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
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">Unable to load dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-blue-50/60 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {data.isNewProfile && <WelcomeBanner />}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#0f1e3d]/50">
              Candidate Dashboard
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0f1e3d]">
              Your Journey Overview
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-[#0f1e3d]">Live Status</span>
          </div>
        </div>

        <DashboardStats dashboard={data} />

        {/* No wrapper borders here — each component already renders its own card */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <RecentApplications />
            <RecentActivity activity={data.recentActivity} />
          </div>

          <div className="space-y-6">
            <ProfileCompletion
              completion={data.profileCompletion}
              sections={data.profileSections}
            />
            <UpcomingInterview />

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
              <MedicalCard />
              <VisaCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Briefcase, CalendarDays, FileCheck, PlaneTakeoff } from "lucide-react";

import StatCard from "@/components/Candidate/common/StatCard";
import type { CandidateDashboard } from "@/lib/candidate/types";

interface Props {
  dashboard: CandidateDashboard;
}

export default function DashboardStats({ dashboard }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Active Applications" value={dashboard.activeApplications} icon={Briefcase} />

      <StatCard title="Upcoming Interviews" value={dashboard.interviews} icon={CalendarDays} />

      <StatCard title="Offers Received" value={dashboard.offers} icon={FileCheck} />

      <StatCard title="Visa Status" value={dashboard.visaStatus} icon={PlaneTakeoff} />
    </div>
  );
}

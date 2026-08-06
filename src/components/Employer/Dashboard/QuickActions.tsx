import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Briefcase, Users, Building2 } from "lucide-react";

const actions = [
  {
    title: "Create Job Order",
    description: "Submit a new recruitment requirement",
    icon: Plus,
    to: "/Employer/job-orders/new",
  },
  {
    title: "View Job Orders",
    description: "Track status across all requirements",
    icon: Briefcase,
    to: "/Employer/job-orders",
  },
  {
    title: "View Candidates",
    description: "Review applicants and shortlist",
    icon: Users,
    to: "/Employer/candidates",
  },
  {
    title: "Company Profile",
    description: "Update details and documents",
    icon: Building2,
    to: "/Employer/company",
  },
] as const;

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.to}
              className="group flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium transition hover:border-blue hover:bg-blue-wash/60"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-wash text-blue transition group-hover:bg-navy group-hover:text-white">
                <Icon className="h-4 w-4" />
              </span>

              <span className="flex flex-col">
                <span>{action.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

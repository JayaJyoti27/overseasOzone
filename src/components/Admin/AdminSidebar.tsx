import {
  LayoutDashboard,
  Building2,
  FileText,
  BriefcaseBusiness,
  Users,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAdminProfile } from "./AdminProfileContext";
import { sectionsForRole, ROLE_LABELS, type AdminSection } from "@/lib/admin/permissions";

const items: { title: string; href: string; icon: typeof LayoutDashboard; section: AdminSection }[] = [
  {
    title: "Dashboard",
    href: "/Admin/dashboard",
    icon: LayoutDashboard,
    section: "dashboard",
  },
  {
    title: "Employers",
    href: "/Admin/employers",
    icon: Building2,
    section: "employers",
  },
  {
    title: "Requirements",
    href: "/Admin/requirements",
    icon: FileText,
    section: "requirements",
  },
  {
    title: "Job Orders",
    href: "/Admin/job-orders",
    icon: BriefcaseBusiness,
    section: "job-orders",
  },
  {
    title: "Candidates",
    href: "/Admin/candidates",
    icon: Users,
    section: "candidates",
  },
  {
    title: "Reports",
    href: "/Admin/reports",
    icon: BarChart3,
    section: "reports",
  },
  {
    title: "Notifications",
    href: "/Admin/notifications",
    icon: Bell,
    section: "notifications",
  },
  {
    title: "Admin Users",
    href: "/Admin/users",
    icon: UserCog,
    section: "admin-users",
  },
  {
    title: "Settings",
    href: "/Admin/settings",
    icon: Settings,
    section: "settings",
  },
];

export default function AdminSidebar() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const { profile } = useAdminProfile();
  const allowedSections = sectionsForRole(profile?.admin_role);
  const visibleItems = items.filter((item) => allowedSections.includes(item.section));

  return (
    <aside className="flex w-72 flex-col border-r border-border bg-white">
      {/* Brand block */}
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-white">
          <ShieldCheck size={18} />
        </span>
        <div className="leading-tight">
          <h1 className="font-display text-lg font-bold text-navy">
            Ozone <span className="text-blue">Overseas</span>
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue">
            Admin Panel
          </p>
        </div>
      </div>

      <div className="mx-6 h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
              ${
                active ? "bg-blue-wash text-navy" : "text-ink hover:bg-blue-wash/60 hover:text-navy"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue" />
              )}
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${
                  active ? "bg-navy text-white" : "bg-blue-wash text-blue group-hover:bg-blue-soft"
                }`}
              >
                <Icon size={16} />
              </span>
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="m-4 rounded-2xl bg-blue-wash p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          MEA Licensed
        </div>
        <p className="mt-1 text-[11px] text-ink">Government of India recruitment license</p>
        {profile?.admin_role && (
          <p className="mt-2 text-[11px] font-semibold text-navy">
            Signed in as {ROLE_LABELS[profile.admin_role]}
          </p>
        )}
      </div>
    </aside>
  );
}

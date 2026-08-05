import { ShieldAlert } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useAdminProfile } from "./AdminProfileContext";
import { canAccess, type AdminSection } from "@/lib/admin/permissions";

// Maps the first path segment after /Admin/ to a permission section.
// Dashboard has no restriction — every admin role can see it.
const PATH_TO_SECTION: Record<string, AdminSection> = {
  employers: "employers",
  requirements: "requirements",
  "job-orders": "job-orders",
  candidates: "candidates",
  notifications: "notifications",
  reports: "reports",
  settings: "settings",
  users: "admin-users",
};

function sectionForPath(pathname: string): AdminSection | null {
  const segment = pathname.split("/")[2]; // "/Admin/employers/123" -> "employers"
  return PATH_TO_SECTION[segment] ?? null;
}

export default function RequirePermission({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, loading } = useAdminProfile();
  const section = sectionForPath(pathname);

  // Still loading the admin's own profile, or this page has no restriction.
  if (loading || !section) return <>{children}</>;

  // If the profile fetch failed entirely, don't block — the backend is the
  // real gate and will 403 on the API calls anyway.
  if (profile && !canAccess(profile.admin_role, section)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-white py-24 text-center">
        <ShieldAlert className="text-blue" size={32} />
        <h2 className="font-display text-lg font-bold text-navy">Access restricted</h2>
        <p className="max-w-sm text-sm text-ink/70">
          Your admin role doesn't have access to this section. Ask a Super Admin if you think this
          is wrong.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

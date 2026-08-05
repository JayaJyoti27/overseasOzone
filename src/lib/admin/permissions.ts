// Mirrors backend/src/constants/adminPermissions.ts.
// The backend is the source of truth for enforcement — this copy only
// decides what the sidebar/pages render. Keep the two in sync by hand;
// there are only 3 roles and this rarely changes.

export const ADMIN_ROLES = ["super_admin", "recruiter", "viewer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminSection =
  | "dashboard"
  | "employers"
  | "requirements"
  | "job-orders"
  | "candidates"
  | "notifications"
  | "reports"
  | "settings"
  | "admin-users";

export const ALL_SECTIONS: AdminSection[] = [
  "dashboard",
  "employers",
  "requirements",
  "job-orders",
  "candidates",
  "notifications",
  "reports",
  "settings",
  "admin-users",
];

const ADMIN_ROLE_PERMISSIONS: Record<Exclude<AdminRole, "super_admin">, AdminSection[]> = {
  recruiter: ["dashboard", "employers", "requirements", "job-orders", "candidates", "notifications"],
  viewer: [
    "dashboard",
    "employers",
    "requirements",
    "job-orders",
    "candidates",
    "notifications",
    "reports",
  ],
};

export function sectionsForRole(role?: AdminRole | null): AdminSection[] {
  if (role === "super_admin" || !role) return ALL_SECTIONS;
  return ADMIN_ROLE_PERMISSIONS[role] ?? [];
}

export function canAccess(role: AdminRole | null | undefined, section: AdminSection): boolean {
  return sectionsForRole(role).includes(section);
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  recruiter: "Recruiter",
  viewer: "Viewer",
};

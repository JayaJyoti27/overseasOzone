/**
 * Simplified Roles & Permissions.
 *
 * On purpose there is NO `roles` / `permissions` DB table here. Three fixed
 * roles, page-level (section-level) access only — not per-action. If you
 * later need "recruiter can view but not edit employers", that's when this
 * upgrades to a real permissions table. Until then, this file is the whole
 * system, and changing what a role can see is a one-line edit here.
 *
 * IMPORTANT: this list must stay in sync with the frontend copy at
 * src/lib/admin/permissions.ts — the backend is the source of truth for
 * enforcement, the frontend copy is only used to decide what to render.
 */

export const ADMIN_ROLES = ["super_admin", "recruiter", "viewer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_SECTIONS = [
  "dashboard",
  "employers",
  "requirements",
  "job-orders",
  "candidates",
  "notifications",
  "reports",
  "settings",
  "admin-users",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/**
 * super_admin isn't listed explicitly — it always has access to everything,
 * checked separately in requirePermission() so this map can't accidentally
 * lock the super admin out by omission.
 */
export const ADMIN_ROLE_PERMISSIONS: Record<Exclude<AdminRole, "super_admin">, AdminSection[]> = {
  // Day-to-day recruitment operations. No Reports, Settings, or Admin Users.
  recruiter: [
    "dashboard",
    "employers",
    "requirements",
    "job-orders",
    "candidates",
    "notifications",
  ],
  // Same visibility as recruiter plus Reports, for oversight without the
  // ability to manage staff or change settings. Note: this is page-level
  // only — a viewer can still see the same action buttons on a page as a
  // recruiter would. Locking down individual buttons is a later upgrade.
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

export function sectionsForRole(role: AdminRole | null | undefined): AdminSection[] {
  if (role === "super_admin") return [...ADMIN_SECTIONS];
  if (role && role in ADMIN_ROLE_PERMISSIONS) {
    return ADMIN_ROLE_PERMISSIONS[role as Exclude<AdminRole, "super_admin">];
  }
  return [];
}

export function roleCanAccess(role: AdminRole | null | undefined, section: AdminSection): boolean {
  return sectionsForRole(role).includes(section);
}

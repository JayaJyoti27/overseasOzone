import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError, BadRequestError } from "../../utils/AppError";
import { ADMIN_ROLES, AdminRole } from "../../constants/adminPermissions";

/*
|--------------------------------------------------------------------------
| List Admin Users
|--------------------------------------------------------------------------
*/

export async function listAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, admin_role, status, invited_at, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    throw new DatabaseError("Unable to fetch admin users.", error);
  }

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| Invite Admin User
|--------------------------------------------------------------------------
| Creates a Supabase Auth user via magic-link invite and a matching
| profiles row with role="admin". They set their own password / land in
| the app the first time they click the invite email link.
*/

export async function inviteAdminUser(params: {
  email: string;
  fullName?: string;
  adminRole: AdminRole;
  invitedBy: string;
}) {
  const { email, fullName, adminRole, invitedBy } = params;

  if (!ADMIN_ROLES.includes(adminRole)) {
    throw new BadRequestError(`adminRole must be one of: ${ADMIN_ROLES.join(", ")}`);
  }

  const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/ResetPassword`,
  });

  if (inviteError || !invited?.user) {
    throw new DatabaseError("Unable to send invite email.", inviteError);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: invited.user.id,
      role: "admin",
      admin_role: adminRole,
      status: "invited",
      full_name: fullName ?? null,
      email,
      invited_by: invitedBy,
      invited_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (profileError) {
    throw new DatabaseError(
      "Invite email sent, but the admin profile failed to save.",
      profileError,
    );
  }

  return profile;
}

/*
|--------------------------------------------------------------------------
| Update Admin Role
|--------------------------------------------------------------------------
*/

export async function updateAdminUserRole(id: string, adminRole: AdminRole) {
  if (!ADMIN_ROLES.includes(adminRole)) {
    throw new BadRequestError(`adminRole must be one of: ${ADMIN_ROLES.join(", ")}`);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ admin_role: adminRole })
    .eq("id", id)
    .eq("role", "admin")
    .select()
    .single();

  if (error || !data) {
    throw new NotFoundError("Admin user not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Suspend / Activate Admin User
|--------------------------------------------------------------------------
*/

export async function suspendAdminUser(id: string, requestingAdminId: string) {
  if (id === requestingAdminId) {
    throw new BadRequestError("You can't suspend your own account.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", id)
    .eq("role", "admin")
    .select()
    .single();

  if (error || !data) {
    throw new NotFoundError("Admin user not found.");
  }

  return data;
}

export async function activateAdminUser(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", id)
    .eq("role", "admin")
    .select()
    .single();

  if (error || !data) {
    throw new NotFoundError("Admin user not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Current Admin's Own Profile (for the frontend to know its own permissions)
|--------------------------------------------------------------------------
*/

export async function getOwnAdminProfile(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, admin_role, status")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new NotFoundError("Profile not found.");
  }

  return data;
}

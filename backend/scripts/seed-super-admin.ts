/**
 * One-off script: creates (or promotes) the founding Super Admin account.
 * Run this once, manually, server-side — it is NOT exposed as an API route
 * on purpose, since it can set an admin password directly.
 *
 * Usage:
 *   cd backend
 *   npx tsx scripts/seed-super-admin.ts support@ozonetravel.in 'Ozone@Admin' "Ozone Support"
 *
 * Args: email  password  [fullName]
 */
import { supabase } from "../src/config/supabase";

async function main() {
  const [email, password, fullName] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/seed-super-admin.ts <email> <password> [fullName]");
    process.exit(1);
  }

  // Does an auth user with this email already exist?
  const { data: existingList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  let authUserId = existingList.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    ?.id;

  if (authUserId) {
    console.log(`Auth user already exists for ${email} (${authUserId}) — updating password.`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
      password,
      email_confirm: true,
    });
    if (updateError) throw updateError;
  } else {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;
    authUserId = created.user!.id;
    console.log(`Created auth user for ${email} (${authUserId}).`);
  }

  // Upsert the profile as an active Super Admin — full access, including
  // Admin Users / Roles & Permissions itself.
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: authUserId,
      role: "admin",
      admin_role: "super_admin",
      status: "active",
      email,
      full_name: fullName ?? null,
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  console.log(`Done. ${email} is now an active Super Admin.`);
  console.log("Log in at your app's admin login page with this email + password.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err.message ?? err);
  process.exit(1);
});

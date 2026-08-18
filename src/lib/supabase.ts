import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "admin" | "employer" | "candidate";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
}

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/Admin/dashboard",
  employer: "/Employer/dashboard",
  candidate: "/Candidates/dashboard",
};

export function roleHomePath(role: UserRole) {
  return ROLE_HOME[role];
}

/** Signs in with the given email + password, returns the user's profile/role. */
export async function loginWithPassword(email: string, password: string): Promise<Profile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Login failed — no user returned.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    console.error("Profile lookup failed:", profileError);
    throw new Error("This account has no role assigned yet.");
  }

  return { ...profile, email: data.user.email ?? "" } as Profile;
}

/** Returns the current logged-in user's profile, or null if not logged in. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", session.user.id)
    .single();

  if (!profile) return null;

  return { ...profile, email: session.user.email ?? "" } as Profile;
}

export async function logout() {
  await supabase.auth.signOut();
}

/**
 * Sends a magic sign-in link to the given email for candidate signup/login.
 * `shouldCreateUser: true` means this also works for brand-new candidates —
 * Supabase creates the auth user the first time they click the link, no
 * separate "sign up" step needed. `emailRedirectTo` brings them straight
 * back to the candidate login page, which then finishes the login.
 */
export async function sendCandidateLoginLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/candidate`,
    },
  });
  if (error) throw new Error(error.message);
}

/**
 * Verifies the 6-digit code from the same email `sendCandidateLoginLink`
 * sends. Supabase's magic-link email includes both the clickable link and
 * a numeric token by default — this lets a candidate type the code instead
 * of switching devices/apps to open the link. On success this creates a
 * real session, same as clicking the link, so the existing
 * `onAuthStateChange` -> `finishLogin()` flow in candidate.tsx picks it up
 * automatically; callers don't need to do anything else here.
 */
export async function verifyCandidateOtp(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw new Error(error.message);
}

/**
 * Sends a magic sign-in link to the given email for employer signup/login.
 * Mirrors sendCandidateLoginLink — `shouldCreateUser: true` lets a brand-new
 * employer request access this way too; their account is created with
 * approval_status "pending" until an admin approves it (see
 * completeEmployerSignup on the backend and the /Employer/pending-approval
 * redirect in the Employer layout route).
 */
export async function sendEmployerLoginLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/employer`,
    },
  });
  if (error) throw new Error(error.message);
}

/**
 * Sends a password-reset email. Works for any account (admin, employer,
 * candidate) — Supabase doesn't require the caller to be logged in as that
 * user, so this also powers the "Send reset link" button an admin can use
 * on someone else's Admin Users row.
 */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/ResetPassword`,
  });
  if (error) throw new Error(error.message);
}

/**
 * Sets a new password for the currently-authenticated session. Call this
 * on the /ResetPassword page after the user lands there from the reset
 * email link (Supabase turns that link into a real session automatically).
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

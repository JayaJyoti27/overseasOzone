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
 * Sends a magic sign-in link to the given email for employer signup/login.
 * Same shape as `sendCandidateLoginLink` — `shouldCreateUser: true` lets a
 * brand-new employer contact sign up just by clicking the link, and
 * `emailRedirectTo` brings them back to the employer login page, which then
 * finishes the login/signup.
 */

/**
 * Sends a magic sign-in link to the given email for employer signup/login.
 * Mirrors sendCandidateLoginLink but redirects back to /employer.
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
 * Creates a brand-new employer account with email + password.
 * After this succeeds, call completeEmployerSignup() (in employer/api.ts)
 * to create the profiles + employers rows, same pattern as candidate.
 */
export async function signupEmployerWithPassword(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Signup failed — no user returned.");
}

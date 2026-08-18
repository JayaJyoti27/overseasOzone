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

/**
 * Supabase's magic-link send can fail two very different ways: a validation
 * problem it can explain (bad email, rate limit) — worth showing as-is — or
 * a raw upstream failure (its email-sending Auth Hook/SMTP provider erroring)
 * which surfaces as a generic string like "Request failed with status code
 * 500". That second kind is meaningless to a candidate/employer, so replace
 * it with something actionable instead of showing the raw HTTP failure.
 */
function toFriendlyAuthError(error: { message?: string; status?: number }): Error {
  const raw = error.message ?? "";
  const looksLikeRawHttpFailure =
    (error.status !== undefined && error.status >= 500) ||
    /request failed with status code \d+/i.test(raw) ||
    /^(unexpected_failure|internal_?server_?error)/i.test(raw);

  if (looksLikeRawHttpFailure) {
    return new Error(
      "We couldn't send the sign-in link right now. Please try again in a moment — if it keeps happening, contact support.",
    );
  }

  return new Error(raw || "Something went wrong. Please try again.");
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

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "admin",
  employer: "employer",
  candidate: "candidate",
};

/**
 * Same as loginWithPassword, but for role-specific portals (the candidate
 * and employer sign-in pages) — rejects a correctly-authenticated user if
 * their account is actually the *other* role, instead of silently sending
 * an employer into the candidate dashboard's route guard to bounce around.
 * Signs the mismatched session out so the failed attempt doesn't linger.
 */
export async function loginWithPasswordAsRole(
  email: string,
  password: string,
  expectedRole: UserRole,
): Promise<Profile> {
  const profile = await loginWithPassword(email, password);

  if (profile.role !== expectedRole) {
    await supabase.auth.signOut();
    const label = ROLE_LABEL[profile.role];
    const article = label === "admin" ? "an" : "a";
    throw new Error(
      `This email is registered as ${article} ${label} account. Please sign in from the ${label} login page instead.`,
    );
  }

  return profile;
}

/**
 * Creates a brand-new account with email + password. Returns whether a
 * session came back immediately: if your Supabase project has "Confirm
 * email" enabled, `session` will be null here and the caller should show a
 * "check your email" step instead of proceeding straight to onboarding —
 * the real session arrives later when they click the confirmation link and
 * land back on `emailRedirectTo`, same as the existing magic-link flows.
 */
export async function signUpWithPassword(email: string, password: string, emailRedirectTo: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });

  if (error) throw toFriendlyAuthError(error);

  return { hasSession: !!data.session };
}

/** Resends the signup confirmation email (only relevant if "Confirm email" is on). */
export async function resendSignupConfirmation(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw toFriendlyAuthError(error);
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
  if (error) throw toFriendlyAuthError(error);
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
  if (error) throw toFriendlyAuthError(error);
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

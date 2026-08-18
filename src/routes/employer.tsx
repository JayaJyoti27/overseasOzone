import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent, useEffect, useRef } from "react";
import { ShieldCheck, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/footer";
import {
  loginWithPasswordAsRole,
  signUpWithPassword,
  resendSignupConfirmation,
  getCurrentProfile,
  supabase,
} from "@/lib/supabase";
import { completeEmployerSignup } from "@/lib/employer/api";

export const Route = createFileRoute("/employer")({
  head: () => ({ meta: [{ title: "Employer Sign In — Ozone Overseas" }] }),
  component: EmployerAuthPage,
});

const Blob = ({
  className = "",
  color = "var(--blue-soft)",
}: {
  className?: string;
  color?: string;
}) => (
  <svg viewBox="0 0 600 600" className={className} aria-hidden>
    <path
      fill={color}
      d="M421,318Q406,386,343,418Q280,450,213,420Q146,390,116,325Q86,260,121,196Q156,132,222,108Q288,84,353,113Q418,142,431,201Q444,250,421,318Z"
    />
  </svg>
);

const DotGrid = ({ className = "" }: { className?: string }) => (
  <div className={`dot-grid ${className}`} aria-hidden />
);

// "signin" / "signup" are the two tabs on the form itself. "confirm" is the
// holding screen shown after signup if the Supabase project has "Confirm
// email" turned on. "finishing" covers the moment we're setting up their
// employer record / bouncing them onward.
type Mode = "signin" | "signup";
type Step = Mode | "confirm" | "finishing";

function EmployerAuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const finishing = useRef(false);
  const checkingProfile = useRef(false);

  /** Runs once a real Supabase session exists — either because the person was
   * already logged in, just signed up with instant confirmation, or just
   * clicked the confirmation link in their email and landed back here.
   * Existing employer profiles go straight to the dashboard (the /Employer
   * layout route itself redirects to /Employer/register or
   * /Employer/pending-approval as needed). Brand-new profiles get a bare
   * profile + employer record created here. */
  async function finishLogin() {
    if (finishing.current || checkingProfile.current) return;
    checkingProfile.current = true;
    setStep("finishing");
    try {
      const profile = await getCurrentProfile();

      if (profile && profile.role !== "employer") {
        await supabase.auth.signOut();
        setError("This account is not registered as an employer.");
        setStep("signin");
        return;
      }

      if (profile) {
        finishing.current = true;
        navigate({ to: "/Employer/dashboard" });
        return;
      }

      await completeEmployerSignup();
      finishing.current = true;
      navigate({ to: "/Employer/dashboard" });
    } catch (err) {
      setStep("signin");
      setError(err instanceof Error ? err.message : "Something went wrong signing you in.");
    } finally {
      checkingProfile.current = false;
    }
  }

  // Already logged in (either from before, or just landed back from the
  // email confirmation link after signup).
  useEffect(() => {
    getCurrentProfile().then((profile) => {
      if (profile?.role === "employer") finishLogin();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") finishLogin();
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithPasswordAsRole(email.trim(), password, "employer");
      // onAuthStateChange picks up the SIGNED_IN event and calls finishLogin().
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign you in. Try again.");
      setSubmitting(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const { hasSession } = await signUpWithPassword(
        email.trim(),
        password,
        `${window.location.origin}/employer`,
      );

      if (hasSession) {
        // Confirmations are off — we already have a session, finish right away.
        finishLogin();
        return;
      }

      setStep("confirm");
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    if (resendCooldown > 0 || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await resendSignupConfirmation(email.trim());
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the confirmation email.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(mode: Mode) {
    setStep(mode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  if (step === "finishing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue" />
          <p className="text-sm text-ink">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      <section className="relative overflow-hidden px-6 py-24">
        <Blob
          className="absolute -top-32 -left-32 h-[420px] w-[420px] opacity-60"
          color="var(--blue-wash)"
        />
        <Blob
          className="absolute -bottom-32 -right-24 h-[360px] w-[360px] opacity-60"
          color="var(--blue-soft)"
        />
        <DotGrid className="absolute top-16 right-16 h-24 w-24 opacity-70" />

        <div className="relative mx-auto max-w-md">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Employer Portal
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
              {step === "signin" && (
                <>
                  Sign in to your <span className="text-blue">account</span>
                </>
              )}
              {step === "signup" && (
                <>
                  Create your <span className="text-blue">account</span>
                </>
              )}
              {step === "confirm" && (
                <>
                  Check your <span className="text-blue">email</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-sm text-ink">
              {step === "signin" && "Enter your work email and password to continue."}
              {step === "signup" && "New here? Set up your account with a work email and password."}
              {step === "confirm" &&
                `We sent a confirmation link to ${email}. Open it on this device to continue.`}
            </p>
          </div>

          {(step === "signin" || step === "signup") && (
            <>
              <div className="mt-8 flex rounded-full border border-border bg-white p-1 shadow-[0_10px_30px_-20px_rgba(11,31,58,0.3)]">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                    step === "signin" ? "bg-navy text-white" : "text-ink hover:text-navy"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                    step === "signup" ? "bg-navy text-white" : "text-ink hover:text-navy"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form
                onSubmit={step === "signin" ? handleSignIn : handleSignUp}
                className="mt-4 rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]"
              >
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                    Work Email
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                    <Mail className="h-4 w-4 text-blue" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      placeholder="you@company.com"
                      className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                    />
                  </div>
                </div>

                <div className={step === "signup" ? "mb-4" : "mb-5"}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                    Password
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                    <Lock className="h-4 w-4 text-blue" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      autoComplete={step === "signup" ? "new-password" : "current-password"}
                      className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                    />
                  </div>
                </div>

                {step === "signup" && (
                  <div className="mb-5">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                      Confirm Password
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                      <Lock className="h-4 w-4 text-blue" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                      />
                    </div>
                  </div>
                )}

                {step === "signin" && (
                  <div className="mb-2 flex justify-end">
                    <a
                      href="/ResetPassword"
                      className="text-xs font-semibold text-blue hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                {error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !email.trim() || !password}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
                >
                  {submitting
                    ? step === "signin"
                      ? "Signing in..."
                      : "Creating account..."
                    : step === "signin"
                      ? "Sign In"
                      : "Create Account"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}

          {step === "confirm" && (
            <div className="mt-8 rounded-[28px] border border-border bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-wash">
                <Mail className="h-6 w-6 text-blue" />
              </div>

              <p className="text-sm text-ink">Didn't get it? Check spam, or resend below.</p>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendCooldown > 0 || submitting}
                className="mt-5 w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
              >
                {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend Email"}
              </button>

              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="mt-4 text-xs font-semibold text-ink hover:text-navy"
              >
                Use a different email
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-ink">
            Looking for the candidate portal?{" "}
            <a href="/candidate" className="font-semibold text-blue">
              Sign in here
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, FormEvent, useEffect, useRef } from "react";
import { ShieldCheck, ArrowRight, Lock, Mail, ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/footer";
import {
  loginWithPassword,
  sendEmployerLoginLink,
  signupEmployerWithPassword,
  getCurrentProfile,
  supabase,
} from "@/lib/supabase";
import { completeEmployerSignup } from "@/lib/employer/api";

export const Route = createFileRoute("/employer")({
  head: () => ({ meta: [{ title: "Employer Sign In — Ozone Overseas" }] }),
  component: EmployerAuthPage,
});

type Tab = "magic-link" | "password";
type MagicStep = "email" | "sent" | "finishing";
type PasswordMode = "signin" | "signup";

function EmployerAuthPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("magic-link");

  // Magic-link state
  const [magicStep, setMagicStep] = useState<MagicStep>("email");
  const [resendCooldown, setResendCooldown] = useState(0);
  const finishing = useRef(false);

  // Shared/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("signin");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** Runs once a real Supabase session exists — either because the person was
   * already logged in, or because they just clicked the magic link and got
   * redirected back here with a session attached. Same pattern as candidate.tsx. */
  async function finishLogin() {
    if (finishing.current) return;
    finishing.current = true;
    setMagicStep("finishing");
    try {
      const { isNewProfile } = await completeEmployerSignup();
      navigate({
        to: isNewProfile ? "/Employer/register" : "/Employer/dashboard",
      });
    } catch (err) {
      finishing.current = false;
      setMagicStep("email");
      setError(err instanceof Error ? err.message : "Something went wrong finishing sign in.");
    }
  }

  // Already logged in (either from before, or just landed back from the email link).
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

  async function handleSendLink(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await sendEmployerLoginLink(email.trim());
      setMagicStep("sent");
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the link. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await sendEmployerLoginLink(email.trim());
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the link.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const profile = await loginWithPassword(email, password);
      if (profile.role !== "employer") {
        setError("This account is not registered as an employer.");
        return;
      }
      navigate({ to: "/Employer/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSignUp(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signupEmployerWithPassword(email, password);
      const { isNewProfile } = await completeEmployerSignup();
      navigate({ to: isNewProfile ? "/Employer/register" : "/Employer/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    setMagicStep("email");
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  if (magicStep === "finishing") {
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
        <div className="relative mx-auto max-w-md">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Employer Login
            </span>

            {tab === "magic-link" && magicStep === "email" && (
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
                Sign in or <span className="text-blue">register</span>
              </h1>
            )}
            {tab === "magic-link" && magicStep === "sent" && (
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
                Check your <span className="text-blue">email</span>
              </h1>
            )}
            {tab === "password" && (
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
                {passwordMode === "signin" ? (
                  <>
                    Sign in with <span className="text-blue">password</span>
                  </>
                ) : (
                  <>
                    Create your <span className="text-blue">account</span>
                  </>
                )}
              </h1>
            )}

            <p className="mt-3 text-sm text-muted-foreground">
              {tab === "magic-link" &&
                magicStep === "email" &&
                "New company or returning — just enter your work email to get started."}
              {tab === "magic-link" &&
                magicStep === "sent" &&
                `We sent a sign-in link to ${email}. Open it on this device to continue.`}
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]">
            <div className="mb-6 flex rounded-full bg-blue-wash/50 p-1">
              <button
                type="button"
                onClick={() => switchTab("magic-link")}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                  tab === "magic-link" ? "bg-navy text-white" : "text-navy/70"
                }`}
              >
                Email Link
              </button>
              <button
                type="button"
                onClick={() => switchTab("password")}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                  tab === "password" ? "bg-navy text-white" : "text-navy/70"
                }`}
              >
                Password
              </button>
            </div>

            {tab === "magic-link" && magicStep === "email" && (
              <form onSubmit={handleSendLink}>
                <FieldEmail email={email} setEmail={setEmail} />
                {error && <ErrorBox message={error} />}
                <SubmitButton
                  submitting={submitting}
                  disabled={!email.trim()}
                  label="Send Sign-In Link"
                />
              </form>
            )}

            {tab === "magic-link" && magicStep === "sent" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-wash">
                  <MailCheck className="h-6 w-6 text-blue" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Didn't get it? Check spam, or resend below.
                </p>
                {error && <ErrorBox message={error} />}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || submitting}
                  className="mt-5 w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
                >
                  {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : "Resend Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMagicStep("email");
                    setError(null);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-navy hover:text-blue"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Use a different email
                </button>
              </div>
            )}

            {tab === "password" && (
              <>
                <div className="mb-5 flex justify-center gap-4 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordMode("signin");
                      setError(null);
                    }}
                    className={passwordMode === "signin" ? "text-blue" : "text-navy/50"}
                  >
                    Sign In
                  </button>
                  <span className="text-navy/20">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordMode("signup");
                      setError(null);
                    }}
                    className={passwordMode === "signup" ? "text-blue" : "text-navy/50"}
                  >
                    Create Account
                  </button>
                </div>

                <form
                  onSubmit={passwordMode === "signin" ? handlePasswordSignIn : handlePasswordSignUp}
                >
                  <FieldEmail email={email} setEmail={setEmail} />
                  <FieldPassword label="Password" password={password} setPassword={setPassword} />
                  {passwordMode === "signup" && (
                    <FieldPassword
                      label="Confirm Password"
                      password={confirmPassword}
                      setPassword={setConfirmPassword}
                    />
                  )}
                  {error && <ErrorBox message={error} />}
                  <SubmitButton
                    submitting={submitting}
                    label={passwordMode === "signin" ? "Sign In" : "Create Account"}
                  />
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Looking for the candidate portal?{" "}
            <Link to="/candidate" className="font-semibold text-blue hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function FieldEmail({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
        Company Email
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
        <Mail className="h-4 w-4 text-blue" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="you@example.com"
          className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-navy/40"
        />
      </div>
    </div>
  );
}

function FieldPassword({
  label,
  password,
  setPassword,
}: {
  label: string;
  password: string;
  setPassword: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
        <Lock className="h-4 w-4 text-blue" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-transparent text-sm text-navy outline-none"
        />
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{message}</p>;
}

function SubmitButton({
  submitting,
  label,
  disabled = false,
}: {
  submitting: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={submitting || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
    >
      {submitting ? "Please wait..." : label}
      {!submitting && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

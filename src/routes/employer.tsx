import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent, useEffect, useRef } from "react";
import { ShieldCheck, ArrowRight, Mail, ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/footer";
import { sendEmployerLoginLink, getCurrentProfile, supabase } from "@/lib/supabase";
import { completeEmployerSignup } from "@/lib/employer/api";

export const Route = createFileRoute("/employer")({
  head: () => ({ meta: [{ title: "Employer Sign In — Ozone Overseas" }] }),
  component: EmployerLoginPage,
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

type Step = "email" | "sent" | "finishing";

function EmployerLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const finishing = useRef(false);

  /** Runs once a real Supabase session exists — either because the person was
   * already logged in, or because they just clicked the link in their email
   * and got redirected back here with a session attached. */
  async function finishLogin() {
    if (finishing.current) return;
    finishing.current = true;
    setStep("finishing");
    try {
      const result = await completeEmployerSignup({
        company_name: "",
        contact_person: "",
        phone: "",
      });

      if (result.isNewProfile) {
        navigate({ to: "/Employer/register" });
      } else if (result.approvalStatus === "approved") {
        navigate({ to: "/Employer/dashboard" });
      } else {
        navigate({ to: "/Employer/pending-approval" });
      }
    } catch (err) {
      finishing.current = false;
      setStep("email");
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
      setStep("sent");
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
              <ShieldCheck className="h-3.5 w-3.5" /> Employer Login
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
              {step === "email" ? (
                <>
                  Sign in or <span className="text-blue">register</span>
                </>
              ) : (
                <>
                  Check your <span className="text-blue">email</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-sm text-ink">
              {step === "email"
                ? "New company or returning — just enter your work email to get started."
                : `We sent a sign-in link to ${email}. Open it on this device to continue.`}
            </p>
          </div>

          {step === "email" ? (
            <form
              onSubmit={handleSendLink}
              className="mt-8 rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]"
            >
              <div className="mb-5">
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
                    placeholder="you@company.com"
                    className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                  />
                </div>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
              >
                {submitting ? "Sending link..." : "Send Sign-In Link"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-[28px] border border-border bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-wash">
                <MailCheck className="h-6 w-6 text-blue" />
              </div>

              <p className="text-sm text-ink">Didn't get it? Check spam, or resend below.</p>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

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
                  setStep("email");
                  setError(null);
                }}
                className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-ink hover:text-navy"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Use a different email
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ArrowRight,
  Mail,
  ArrowLeft,
  MailCheck,
  Loader2,
  Building2,
  User,
  Phone,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/footer";
import { sendEmployerLoginLink, getCurrentProfile, supabase } from "@/lib/supabase";
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

type Step = "email" | "sent" | "details" | "finishing";

function EmployerAuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const finishing = useRef(false);
  const checkingProfile = useRef(false);

  /** Runs once a real Supabase session exists — either because the person was
   * already logged in, or because they just clicked the link in their email
   * and got redirected back here with a session attached. Existing employer
   * profiles go straight to the dashboard (the /Employer layout route itself
   * redirects to /Employer/pending-approval if they're not approved yet).
   * Brand-new profiles are asked for their company details first. */
  async function finishLogin() {
    if (finishing.current || checkingProfile.current) return;
    checkingProfile.current = true;
    setStep("finishing");
    try {
      const profile = await getCurrentProfile();

      if (profile && profile.role !== "employer") {
        setError("This account is not registered as an employer.");
        setStep("email");
        return;
      }

      if (profile) {
        finishing.current = true;
        navigate({ to: "/Employer/dashboard" });
        return;
      }

      // No profile yet — first time this person has signed in. Collect
      // company details before we create the employer record.
      setStep("details");
    } catch (err) {
      setStep("email");
      setError(err instanceof Error ? err.message : "Something went wrong signing you in.");
    } finally {
      checkingProfile.current = false;
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

  async function handleCompleteSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await completeEmployerSignup({
        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
      });
      navigate({ to: "/Employer/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't complete your registration.");
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
              <ShieldCheck className="h-3.5 w-3.5" /> Employer Portal
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
              {step === "email" && (
                <>
                  Sign in or <span className="text-blue">register</span>
                </>
              )}
              {step === "sent" && (
                <>
                  Check your <span className="text-blue">email</span>
                </>
              )}
              {step === "details" && (
                <>
                  Tell us about your <span className="text-blue">company</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-sm text-ink">
              {step === "email" &&
                "New here or returning — just enter your work email to get started."}
              {step === "sent" &&
                `We sent a sign-in link to ${email}. Open it on this device to continue.`}
              {step === "details" &&
                "One-time setup. Our team reviews new employer accounts before they go live."}
            </p>
          </div>

          {step === "email" && (
            <form
              onSubmit={handleSendLink}
              className="mt-8 rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]"
            >
              <div className="mb-5">
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
          )}

          {step === "sent" && (
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

          {step === "details" && (
            <form
              onSubmit={handleCompleteSignup}
              className="mt-8 rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]"
            >
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                  Company Name
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                  <Building2 className="h-4 w-4 text-blue" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    autoFocus
                    placeholder="Acme Contracting LLC"
                    className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                  Contact Person
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                  <User className="h-4 w-4 text-blue" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                    placeholder="Jane Doe"
                    className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                  Phone
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                  <Phone className="h-4 w-4 text-blue" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+971 50 123 4567"
                    className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                  />
                </div>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={
                  submitting || !companyName.trim() || !contactPerson.trim() || !phone.trim()
                }
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
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

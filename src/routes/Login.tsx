import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/footer";
import { loginWithPassword, roleHomePath, requestPasswordReset } from "@/lib/supabase";

export const Route = createFileRoute("/Login")({
  head: () => ({
    meta: [{ title: "Sign In — Ozone Overseas" }],
  }),
  component: LoginPage,
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

// Explicit email -> dashboard overrides for known staff accounts.
// Falls back to roleHomePath(profile.role) for any email not listed here.
const EMAIL_ROLE_OVERRIDES: Record<string, string> = {
  "itsupport@ozonetravel.in": "/Admin/dashboard",
  "heads.ops@ozoneoverseas.in": "/Employer/dashboard",
  "applications@ozoneoverseas.in": "/Candidates/dashboard",
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const profile = await loginWithPassword(email, password);
      const overridePath = EMAIL_ROLE_OVERRIDES[email.trim().toLowerCase()];
      navigate({ to: overridePath ?? roleHomePath(profile.role) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first, then tap \"Forgot password?\".");
      return;
    }
    setForgotStatus("sending");
    try {
      await requestPasswordReset(email);
      setForgotStatus("sent");
    } catch {
      setForgotStatus("error");
    }
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
              <ShieldCheck className="h-3.5 w-3.5" /> Secure Staff Login
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
              Sign in to your <span className="text-blue">Dashboard</span>
            </h1>
            <p className="mt-3 text-sm text-ink">Please Login with your given Id.</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]"
          >
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                <Mail className="h-4 w-4 text-blue" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@ozoneoverseas.in"
                  className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                />
              </div>
            </div>

            <div className="mb-5">
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
                  className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                />
              </div>
            </div>

            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-blue hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {forgotStatus === "sent" && (
              <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                If an account exists for {email}, a reset link is on its way.
              </p>
            )}
            {forgotStatus === "error" && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                Couldn't send the reset email. Try again in a moment.
              </p>
            )}

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink">
            Trouble signing in? Contact{" "}
            <a href="mailto:itsupport@ozonetravel.in" className="font-semibold text-blue">
              itsupport@ozonetravel.in
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

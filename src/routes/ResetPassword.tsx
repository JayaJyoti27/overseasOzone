import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/footer";
import { updatePassword } from "@/lib/supabase";

export const Route = createFileRoute("/ResetPassword")({
  head: () => ({
    meta: [{ title: "Reset Password — Ozone Overseas" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate({ to: "/Login" }), 1800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't update your password. The reset link may have expired — request a new one.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      <section className="relative overflow-hidden px-6 py-24">
        <div className="relative mx-auto max-w-md">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Set a New Password
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
              Choose a <span className="text-blue">new password</span>
            </h1>
          </div>

          {done ? (
            <div className="mt-8 rounded-[28px] border border-border bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]">
              <p className="text-sm text-emerald-700">
                Password updated. Taking you to sign in…
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-[28px] border border-border bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]"
            >
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                  New password
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                  <Lock className="h-4 w-4 text-blue" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
                  Confirm password
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
                  <Lock className="h-4 w-4 text-blue" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/50"
                  />
                </div>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
              >
                {submitting ? "Updating..." : "Update password"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  getAdminUsers,
  inviteAdminUser,
  updateAdminUserRole,
  suspendAdminUser,
  activateAdminUser,
  getAdminLoginHistory,
} from "@/lib/admin/api";
import { ADMIN_ROLES, ROLE_LABELS, type AdminRole } from "@/lib/admin/permissions";
import { useAdminProfile } from "@/components/Admin/AdminProfileContext";
import { requestPasswordReset } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, UserCog, Inbox, UserPlus, History, KeyRound } from "lucide-react";

export const Route = createFileRoute("/Admin/users/")({
  component: AdminUsersPage,
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  invited: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15",
  suspended: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
};

function StatusPill({ status }: { status?: string }) {
  const key = (status || "").toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[key] ?? "bg-blue-wash text-blue ring-1 ring-inset ring-blue/15"
      }`}
    >
      {status || "-"}
    </span>
  );
}

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "??";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join("");
}

const GRID_COLS = "grid-cols-[1.4fr_1fr_0.7fr_2.1fr]";

function InviteAdminDialog({ onInvited }: { onInvited: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AdminRole>("recruiter");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!email) {
      setError("Email is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await inviteAdminUser({ email, fullName: fullName || undefined, adminRole: role });
      setOpen(false);
      setEmail("");
      setFullName("");
      setRole("recruiter");
      onInvited();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't send the invite. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-navy px-4 text-sm font-medium text-white hover:bg-navy/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite an admin user</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-navy/60">
              Email
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-navy/60">
              Name (optional)
            </label>
            <Input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-navy/60">
              Role
            </label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Sending invite…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function LoginHistoryDialog({ userId, userLabel }: { userId: string; userLabel: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  async function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const data = await getAdminLoginHistory(userId);
        setRows(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-full border-border bg-white px-3.5 text-xs font-medium shadow-none"
        >
          <History className="mr-1.5 h-3.5 w-3.5" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login history — {userLabel}</DialogTitle>
        </DialogHeader>

        <div className="max-h-80 space-y-2 overflow-y-auto py-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-blue" size={20} />
            </div>
          )}

          {!loading && rows.length === 0 && (
            <p className="py-8 text-center text-sm text-ink/60">No recorded logins yet.</p>
          )}

          {!loading &&
            rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5 text-sm"
              >
                <span className="font-medium text-navy">{formatWhen(r.created_at)}</span>
                <span className="text-xs text-ink/60">{r.ip_address || "Unknown IP"}</span>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminUsersPage() {
  const { profile: me } = useAdminProfile();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || "Couldn't load admin users. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(id: string, adminRole: AdminRole) {
    await updateAdminUserRole(id, adminRole);
    load();
  }

  async function toggleSuspend(id: string, status: string) {
    if (status === "suspended") {
      await activateAdminUser(id);
    } else {
      await suspendAdminUser(id);
    }
    load();
  }

  const [resetSentFor, setResetSentFor] = useState<string | null>(null);

  async function sendReset(email: string) {
    if (!email) return;
    try {
      await requestPasswordReset(email);
      setResetSentFor(email);
      setTimeout(() => setResetSentFor((cur) => (cur === email ? null : cur)), 4000);
    } catch {
      // requestPasswordReset already swallows most errors on the Supabase
      // side; nothing actionable to show here beyond trying again.
    }
  }

  const filtered = useMemo(() => {
    return users.filter((u) => JSON.stringify(u).toLowerCase().includes(search.toLowerCase()));
  }, [search, users]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue" size={28} />
        <p className="text-sm text-ink">Loading admin users…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-wash text-blue">
            <UserCog className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-navy">Admin Users</h1>
            <p className="text-sm text-ink/80">
              Staff accounts with access to this admin panel, and what each role can see.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <Input
              className="rounded-full border-border bg-white pl-9 shadow-sm focus-visible:ring-blue/40"
              placeholder="Search admin users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <InviteAdminDialog onInvited={load} />
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div
          className={`grid ${GRID_COLS} items-center gap-3 border-b border-border bg-blue-wash/40 px-6 py-3.5`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">User</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">Role</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-navy/60">Status</span>
          <span className="text-right text-xs font-semibold uppercase tracking-wide text-navy/60">
            Actions
          </span>
        </div>

        {loadError ? (
          <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-16 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500">
              <Inbox size={20} />
            </span>
            <p className="text-sm text-red-600">{loadError}</p>
            <button onClick={load} className="text-xs font-semibold text-blue underline">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 px-6 py-16 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-wash text-blue">
              <Inbox size={20} />
            </span>
            <p className="text-sm text-ink">No admin users found.</p>
            <p className="text-xs text-ink/60">Invite one with the button above.</p>
          </div>
        ) : (
          filtered.map((u) => {
            const isSelf = u.id === me?.id;
            return (
              <div
                key={u.id}
                className={`grid ${GRID_COLS} items-center gap-3 border-b border-border px-6 py-3.5 text-sm last:border-0`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-wash text-[11px] font-semibold text-blue">
                    {initials(u.full_name, u.email)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-navy">
                      {u.full_name || "—"}
                      {isSelf && <span className="ml-1.5 text-xs text-ink/50">(you)</span>}
                    </span>
                    <span className="block truncate text-xs text-ink/60">{u.email}</span>
                  </span>
                </span>

                <Select
                  value={u.admin_role ?? "recruiter"}
                  onValueChange={(v) => changeRole(u.id, v as AdminRole)}
                  disabled={isSelf}
                >
                  <SelectTrigger className="h-9 w-40 rounded-full border-border bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span>
                  <StatusPill status={u.status} />
                </span>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <LoginHistoryDialog userId={u.id} userLabel={u.full_name || u.email || "Admin"} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full border-border bg-white px-3.5 text-xs font-medium shadow-none"
                    onClick={() => sendReset(u.email)}
                  >
                    <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                    {resetSentFor === u.email ? "Link sent" : "Reset link"}
                  </Button>
                  {!isSelf && (
                    <Button
                      size="sm"
                      variant={u.status === "suspended" ? "secondary" : "destructive"}
                      className={`h-8 rounded-full px-3.5 text-xs font-medium shadow-none ${
                        u.status === "suspended" ? "bg-blue-wash text-blue hover:bg-blue-soft" : ""
                      }`}
                      onClick={() => toggleSuspend(u.id, u.status)}
                    >
                      {u.status === "suspended" ? "Activate" : "Suspend"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

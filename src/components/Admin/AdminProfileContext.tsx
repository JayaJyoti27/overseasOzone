import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMyAdminProfile } from "@/lib/admin/api";
import type { AdminRole } from "@/lib/admin/permissions";

interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  admin_role: AdminRole | null;
  status: string;
}

interface AdminProfileContextValue {
  profile: AdminProfile | null;
  loading: boolean;
  error: string | null;
}

const AdminProfileContext = createContext<AdminProfileContextValue>({
  profile: null,
  loading: true,
  error: null,
});

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyAdminProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: any) => {
        // Keep no restrictions applied on the frontend when this fails —
        // the backend still enforces the real permission checks — but now
        // surface *why* it failed instead of silently hiding it.
        if (!cancelled) {
          setProfile(null);
          setError(err?.response?.data?.message || "Couldn't load your admin profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminProfileContext.Provider value={{ profile, loading, error }}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  return useContext(AdminProfileContext);
}

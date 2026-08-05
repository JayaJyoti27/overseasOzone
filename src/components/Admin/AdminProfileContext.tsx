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
}

const AdminProfileContext = createContext<AdminProfileContextValue>({
  profile: null,
  loading: true,
});

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getMyAdminProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        // If this fails, treat it as "no restrictions" rather than locking
        // the page — the backend still enforces the real permission checks.
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminProfileContext.Provider value={{ profile, loading }}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  return useContext(AdminProfileContext);
}

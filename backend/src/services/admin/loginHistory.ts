import { supabase } from "../../config/supabase";
import { DatabaseError } from "../../utils/AppError";

const DEDUPE_WINDOW_MINUTES = 15;

/**
 * Records a login event for an admin, but only if their last recorded
 * login was more than DEDUPE_WINDOW_MINUTES ago. Called from verifyAuth on
 * every successful admin request, so this dedupe is what keeps the table
 * from getting a row per API call instead of a row per "session".
 * Failures here are swallowed — logging history should never break a
 * real request.
 */
export async function recordAdminLoginIfNeeded(params: {
  userId: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const { data: last } = await supabase
      .from("admin_login_history")
      .select("created_at")
      .eq("user_id", params.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last) {
      const minutesSince = (Date.now() - new Date(last.created_at).getTime()) / 60000;
      if (minutesSince < DEDUPE_WINDOW_MINUTES) return;
    }

    await supabase.from("admin_login_history").insert({
      user_id: params.userId,
      email: params.email ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    });
  } catch {
    // Never let login-history logging break an actual request.
  }
}

export async function listAdminLoginHistory(userId: string, limit = 25) {
  const { data, error } = await supabase
    .from("admin_login_history")
    .select("id, ip_address, user_agent, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new DatabaseError("Unable to fetch login history.", error);
  }

  return data ?? [];
}

-- =====================================================
-- ADMIN LOGIN HISTORY
-- =====================================================
-- One row per "login session", not per API call — verifyAuth only inserts
-- a new row if the admin's last recorded login was more than 15 minutes
-- ago, so a normal working session doesn't spam this table with a row per
-- request.

CREATE TABLE IF NOT EXISTS public.admin_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_login_history_user_id_created_at_idx
  ON public.admin_login_history (user_id, created_at DESC);

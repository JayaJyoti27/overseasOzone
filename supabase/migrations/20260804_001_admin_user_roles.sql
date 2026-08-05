-- =====================================================
-- ADMIN USER ROLES (simple, page-level version)
-- =====================================================
-- Adds just enough to profiles to support:
--   - multiple admin/staff accounts (Admin Users)
--   - a small fixed set of roles used for page-level gating (Roles & Permissions)
-- No separate roles/permissions tables — the allowed-sections-per-role map
-- lives in code (backend/src/constants/adminPermissions.ts), not the DB.
-- Keeping it in code means adding/renaming a role is a one-line change,
-- not a migration + admin UI to manage it.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS admin_role text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS invited_at timestamptz;

-- Keep admin_role sane at the DB level too, not just in app code.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_admin_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_admin_role_check
      CHECK (admin_role IS NULL OR admin_role IN ('super_admin', 'recruiter', 'viewer'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('active', 'invited', 'suspended'));
  END IF;
END$$;

-- Any admin that already exists (your current login) becomes super_admin
-- so you don't lock yourself out.
UPDATE public.profiles
SET admin_role = 'super_admin', status = 'active'
WHERE role = 'admin' AND admin_role IS NULL;

-- =====================================================
-- applications.internal_status
-- =====================================================
-- backend/src/services/employer/candidate.ts and
-- backend/src/services/admin/recruitment/application.ts
-- both filter/select on applications.internal_status, and
-- 20260803_001_application_status_history.sql documents the
-- status/internal_status split, but no migration in this repo
-- ever actually created the column. If it was added by hand
-- outside of migrations, this is a no-op; if it wasn't, this
-- is why employers can't see any candidates.
-- =====================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS internal_status application_status;

-- Backfill existing rows: anything already candidate-visible past
-- "applied" can safely carry the same value into internal_status.
-- Rows still sitting at "applied" move to "application_received",
-- matching the new default set in applyForJob() (services/candidates/
-- application.ts) — plain "applied" with no internal_status is what
-- made those applications invisible to employers in the first place.
UPDATE public.applications
SET internal_status = CASE
  WHEN status = 'applied' THEN 'application_received'::application_status
  ELSE status
END
WHERE internal_status IS NULL;

CREATE INDEX IF NOT EXISTS applications_internal_status_idx
  ON public.applications (internal_status);

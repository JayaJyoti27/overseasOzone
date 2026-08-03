-- =====================================================
-- application_status_history
-- =====================================================
-- backend/src/services/candidates/application.ts
-- (getApplicationTimeline) already selects from this table
-- to build the candidate-facing timeline, but the table has
-- never existed and nothing writes to it. This migration
-- creates it.
--
-- Design kept intentionally as-is (not "fixed"):
--   applications.status           -> candidate-visible stage
--   applications.internal_status  -> admin/recruiter-visible stage
-- These stay two separate columns on `applications`. This
-- table is the audit trail of changes to EITHER column, so a
-- single `status` enum value stored per row can represent a
-- change to the public status or the internal status. Callers
-- (application.ts / admin/recruitment/application.ts) are
-- responsible for writing one row here every time they update
-- `applications.status` or `applications.internal_status`.
-- (Wiring up those writes is a separate step — out of scope
-- here.)
--
-- CANDIDATE-VISIBLE vs INTERNAL-ONLY
-- -----------------------------------------------------
-- application_status has 16 values. Of those, 2 are
-- recruiter/admin operational bookkeeping stages that a
-- candidate should never see (too granular / exposes internal
-- workflow, e.g. "is anyone reading my CV yet"). The remaining
-- 14 are safe to surface directly to a candidate as their
-- application progresses. This is the mapping the candidate
-- timeline UI (ApplicationTimeline.tsx) and any endpoint that
-- decides what to show a candidate should use.
--
--   INTERNAL ONLY (2) - valid only in `internal_status`,
--   must never be written to `status` or shown to a candidate:
--     - application_received   (ops: intake acknowledged, pre-review)
--     - cv_under_review        (ops: recruiter actively screening)
--
--   CANDIDATE VISIBLE (14) - valid in both `status` and
--   `internal_status`; safe to show in the candidate timeline:
--     - applied
--     - employer_shortlisted
--     - interview_scheduled
--     - interview_completed
--     - selected
--     - offer_letter_issued
--     - documents_verification
--     - medical
--     - visa_processing
--     - visa_approved
--     - ticket_confirmed
--     - deployed
--     - rejected
--     - withdrawn
--
-- When an admin sets `internal_status` to one of the 2
-- internal-only values, `status` should simply stay at its
-- last candidate-visible value until the internal workflow
-- progresses to a candidate-visible stage again. That mapping
-- logic (a status -> status function) is not implemented by
-- this migration; this migration only creates the audit table
-- and documents the split so the next step can implement it.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.application_status_history (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status         application_status NOT NULL,
  changed_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- getApplicationTimeline filters by application_id and orders by created_at
CREATE INDEX IF NOT EXISTS application_status_history_application_id_created_at_idx
  ON public.application_status_history (application_id, created_at);

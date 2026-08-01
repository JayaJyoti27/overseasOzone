-- Adds the fields needed for a proper job requirement intake form:
-- a named point of contact for this specific request, plus the same
-- compensation/logistics/description fields job_orders already has -
-- so nothing gets lost when a requirement is later converted to a job order.
--
-- All columns are nullable / have safe defaults, so this is a pure additive
-- change - existing rows and existing code paths are unaffected.

ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS salary_min numeric,
  ADD COLUMN IF NOT EXISTS salary_max numeric,
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS contract_duration text,
  ADD COLUMN IF NOT EXISTS working_hours text,
  ADD COLUMN IF NOT EXISTS accommodation boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS transport boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS food boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS job_description text,
  ADD COLUMN IF NOT EXISTS qualifications text,
  ADD COLUMN IF NOT EXISTS benefits text;

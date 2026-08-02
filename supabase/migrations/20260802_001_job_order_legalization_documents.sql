-- =====================================================
-- Legalization document checklist for Job Orders.
--
-- Real-world background (Indian Emigration Act 1983 /
-- MEA "Protector General of Emigrants" process, which
-- governs recruitment for ECR countries):
--
--   1. Recruiting Agent must first obtain a Demand Letter,
--      Specimen Employment Contract, and Power of Attorney
--      from the foreign employer.
--   2. For unskilled/women workers being recruited for ECR
--      (Emigration Check Required) countries, those three
--      documents must be attested by the Indian
--      Embassy/Consulate in the destination country.
--      Some destinations (e.g. Oman) also require the demand
--      letter to be attested locally first (Chamber of
--      Commerce + Ministry of Foreign Affairs) before it can
--      go to the Indian Mission.
--   3. The Recruiting Agent then submits the attested demand
--      letter to the Protector of Emigrants (PoE) to obtain
--      permission to recruit against it (Form VI).
--   4. Only once that's done can recruitment for the job
--      order legally proceed - this is the real-world content
--      behind the "legalization_in_progress" status.
--
-- This table tracks that checklist per job order instead of
-- the status being a single opaque flag.
-- Safe to re-run (IF NOT EXISTS everywhere).
-- =====================================================

DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='legalization_document_type') THEN
CREATE TYPE legalization_document_type AS ENUM (
  'demand_letter',
  'specimen_employment_contract',
  'power_of_attorney',
  'local_chamber_attestation',
  'destination_mofa_attestation',
  'indian_mission_attestation',
  'poe_recruitment_permission',
  'recruiting_agent_registration_certificate',
  'other'
);
END IF;
END$$;

DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='legalization_document_status') THEN
CREATE TYPE legalization_document_status AS ENUM (
  'pending',
  'submitted',
  'attested',
  'rejected'
);
END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.job_order_legalization_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  job_order_id uuid NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,

  document_type legalization_document_type NOT NULL,

  -- Human-readable label, editable per row so admins can rename
  -- e.g. "Qatar Chamber of Commerce Attestation" for 'other' rows
  -- without needing a new enum value for every destination country.
  label text NOT NULL,

  -- Which authority actually issues/attests this document,
  -- e.g. "Indian Embassy, Muscat" or "Protector of Emigrants, Delhi".
  authority text,

  -- Not every document applies to every job order (depends on
  -- destination country and skill category), so this is
  -- per-row rather than assumed from document_type alone.
  is_required boolean NOT NULL DEFAULT true,

  status legalization_document_status NOT NULL DEFAULT 'pending',

  reference_number text,

  -- URL to the uploaded attested copy (Supabase storage), added
  -- once the file-upload piece of this feature is built.
  file_url text,

  submitted_at timestamptz,
  completed_at timestamptz,

  notes text,

  -- Loose reference to the admin who last touched this row.
  -- Not a hard FK, matching how admin ids are stored elsewhere
  -- in this codebase (e.g. activity_logs.user_id).
  updated_by uuid,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_order_legalization_documents_job_order_id
  ON public.job_order_legalization_documents(job_order_id);

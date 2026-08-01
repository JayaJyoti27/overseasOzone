-- =====================================================
-- Add `branches` JSONB array column to `employers` so
-- the Company Profile > Branches section can actually
-- persist data (same pattern as the candidate profile
-- education/experience/skills/languages arrays).
-- Safe to re-run (IF NOT EXISTS on the column).
-- =====================================================

ALTER TABLE public.employers
  ADD COLUMN IF NOT EXISTS branches jsonb NOT NULL DEFAULT '[]'::jsonb;

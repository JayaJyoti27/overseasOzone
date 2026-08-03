import { supabase } from "../../../config/supabase";
import { isCandidateVisibleStatus } from "../../../constants/applicationStatus";

/*
|--------------------------------------------------------------------------
| Record Status Change
|--------------------------------------------------------------------------
| Call this AFTER `applications.internal_status` has already been updated
| by the caller. It does two things:
|
|   1. Writes an audit row to `application_status_history` with the new
|      internal_status (the full, fine-grained value — this table is the
|      admin-facing audit trail, so it always gets the precise stage).
|
|   2. If that internal_status is one of the 14 candidate-visible stages
|      (see constants/applicationStatus.ts), mirrors it onto the
|      candidate-facing `applications.status` column. If it's one of the
|      2 internal-only stages (application_received, cv_under_review),
|      `status` is left untouched so the candidate keeps seeing their
|      last real milestone instead of an internal bookkeeping stage.
|
| This is intentionally best-effort: a failure here is logged but does not
| throw, so a logging/sync problem never rolls back or masks the primary
| internal_status update the caller already committed.
*/

interface RecordStatusChangeOptions {
  changedBy?: string;
  notes?: string;
}

export async function recordStatusChange(
  applicationId: string,
  internalStatus: string,
  options: RecordStatusChangeOptions = {},
) {
  const { changedBy, notes } = options;

  const { error: historyError } = await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status: internalStatus,
    changed_by: changedBy ?? null,
    notes: notes ?? null,
  });

  if (historyError) {
    console.error(
      `[application_status_history] Failed to log status change for application ${applicationId}:`,
      historyError,
    );
  }

  if (isCandidateVisibleStatus(internalStatus)) {
    const { error: statusError } = await supabase
      .from("applications")
      .update({ status: internalStatus })
      .eq("id", applicationId);

    if (statusError) {
      console.error(
        `[applications.status] Failed to sync candidate-visible status for application ${applicationId}:`,
        statusError,
      );
    }
  }
}

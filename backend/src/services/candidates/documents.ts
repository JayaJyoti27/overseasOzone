import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";

/*
|--------------------------------------------------------------------------
| My Documents
|--------------------------------------------------------------------------
*/

export async function getCandidateDocuments(candidateId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new DatabaseError("Unable to fetch documents.", error);
  }

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| Document Details
|--------------------------------------------------------------------------
*/

export async function getCandidateDocument(candidateId: string, documentId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("candidate_id", candidateId)
    .eq("id", documentId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Document not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Upload Document
|--------------------------------------------------------------------------
*/

export async function uploadCandidateDocument(candidateId: string, payload: any) {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      ...payload,
      candidate_id: candidateId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Unable to upload document: ${error.message}`, error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Replace Document
|--------------------------------------------------------------------------
*/

export async function replaceCandidateDocument(
  candidateId: string,
  documentId: string,
  payload: any,
) {
  const { data, error } = await supabase
    .from("documents")
    .update({
      ...payload,
      version: payload.version ?? 2,
      status: "pending",
      verified_by: null,
      verified_at: null,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("candidate_id", candidateId)
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to replace document.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Delete Document
|--------------------------------------------------------------------------
*/

export async function deleteCandidateDocument(candidateId: string, documentId: string) {
  // Confirm the document belongs to this candidate before touching anything.
  const { data: existing, error: findError } = await supabase
    .from("documents")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("id", documentId)
    .single();

  if (findError || !existing) {
    throw new NotFoundError("Document not found.");
  }

  // Every upload/verify/reject action writes a document_history row, so a
  // document almost always has at least one history row referencing it via
  // a foreign key. Deleting the document without clearing those first fails
  // with a FK violation on essentially every document, every time.
  const { error: historyError } = await supabase
    .from("document_history")
    .delete()
    .eq("document_id", documentId);

  if (historyError) {
    throw new DatabaseError("Unable to clear document history.", historyError);
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("candidate_id", candidateId)
    .eq("id", documentId);

  if (error) {
    // Still referenced elsewhere (e.g. a medical report or visa ticket
    // points at this exact file) — give a real reason instead of a raw
    // Postgres error.
    if (error.code === "23503") {
      throw new DatabaseError(
        "This document is linked to a medical, visa, or deployment record and can't be deleted while it's in use.",
        error,
      );
    }

    throw new DatabaseError("Unable to delete document.", error);
  }

  return {
    success: true,
  };
}

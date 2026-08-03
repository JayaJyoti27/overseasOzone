import { supabase } from "../../../config/supabase";
import { DatabaseError, NotFoundError } from "../../../utils/AppError";

interface DocumentFilters {
  page?: number;
  limit?: number;
  applicationId?: string;
  candidateId?: string;
  employerId?: string;
  status?: string;
  documentType?: string;
}

/*
|--------------------------------------------------------------------------
| List Documents
|--------------------------------------------------------------------------
*/

export async function getDocuments(filters: DocumentFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("documents").select(
    `
      *,
      candidate:candidates(
        id,
        full_name:name
      ),
      application:applications(
        id,
        internal_status
      )
      `,
    {
      count: "exact",
    },
  );

  if (filters.applicationId) {
    query = query.eq("application_id", filters.applicationId);
  }

  if (filters.candidateId) {
    query = query.eq("candidate_id", filters.candidateId);
  }

  if (filters.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.documentType) {
    query = query.eq("document_type", filters.documentType);
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch documents.", error);
  }

  return {
    documents: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

/*
|--------------------------------------------------------------------------
| Document Details
|--------------------------------------------------------------------------
*/

export async function getDocument(documentId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Document not found.");
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Verify Document
|--------------------------------------------------------------------------
*/

export async function verifyDocument(documentId: string, adminId: string) {
  const { data, error } = await supabase
    .from("documents")
    .update({
      status: "verified",

      verified_by: adminId,

      verified_at: new Date().toISOString(),

      rejection_reason: null,

      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to verify document.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Reject Document
|--------------------------------------------------------------------------
*/

export async function rejectDocument(documentId: string, adminId: string, reason: string) {
  const { data, error } = await supabase
    .from("documents")
    .update({
      status: "rejected",

      verified_by: adminId,

      verified_at: new Date().toISOString(),

      rejection_reason: reason,

      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to reject document.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Document Expiry
|--------------------------------------------------------------------------
*/

export async function getExpiringDocuments(days = 30) {
  const expiryDate = new Date();

  expiryDate.setDate(expiryDate.getDate() + days);

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      candidate:candidates(
        full_name:name
      )
    `,
    )
    .lte("expires_at", expiryDate.toISOString())
    .order("expires_at", {
      ascending: true,
    });

  if (error) {
    throw new DatabaseError("Unable to fetch expiring documents.", error);
  }

  return data ?? [];
}

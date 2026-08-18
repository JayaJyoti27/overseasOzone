import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";
import { getSignedDocumentUrl } from "../storage";
import { sendEmail } from "../email";

const EMPLOYER_DOCUMENTS_BUCKET = "employer-documents";

interface EmployerFilters {
  page?: number;
  limit?: number;
  status?: string;
  approvalStatus?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| Employer List
|--------------------------------------------------------------------------
*/

export async function getEmployers(filters: EmployerFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("employers").select("*", {
    count: "exact",
  });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.approvalStatus) {
    query = query.eq("approval_status", filters.approvalStatus);
  }

  if (filters.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,
       contact_person.ilike.%${filters.search}%,
       email.ilike.%${filters.search}%`,
    );
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new DatabaseError("Unable to fetch employers.", error);

  return {
    employers: data ?? [],
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
| Employer Details
|--------------------------------------------------------------------------
*/

export async function getEmployer(employerId: string) {
  const { data, error } = await supabase
    .from("employers")
    .select("*")
    .eq("id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Employer not found.");
  }

  const { data: requirements } = await supabase
    .from("requirements")
    .select(
      `
        id,
        role,
        country,
        headcount,
        status,
        created_at
      `,
    )
    .eq("employer_id", employerId)
    .order("created_at", {
      ascending: false,
    });

  const { data: rawDocuments } = await supabase
    .from("employer_documents")
    .select(
      `
        id,
        document_type,
        file_name:name,
        file_url,
        status,
        uploaded_at
      `,
    )
    .eq("employer_id", employerId)
    .order("uploaded_at", { ascending: false });

  const documents = await Promise.all(
    (rawDocuments ?? []).map(async (doc) => ({
      ...doc,
      // Regenerate a fresh signed URL every time this is read, so the link
      // always opens regardless of whether the storage bucket is public.
      file_url: await getSignedDocumentUrl(EMPLOYER_DOCUMENTS_BUCKET, doc.file_url),
    })),
  );

  return {
    employer: data,
    requirements: requirements ?? [],
    documents,
  };
}

/*
|--------------------------------------------------------------------------
| Pending Employers
|--------------------------------------------------------------------------
*/

export async function getPendingEmployers() {
  const { data, error } = await supabase
    .from("employers")
    .select("*")
    .eq("approval_status", "pending")
    .order("created_at");

  if (error) throw new DatabaseError("Unable to fetch pending employers.", error);

  return data ?? [];
}
/*
|--------------------------------------------------------------------------
| Approve Employer
|--------------------------------------------------------------------------
*/

export async function approveEmployer(employerId: string, adminId: string) {
  const { data, error } = await supabase
    .from("employers")
    .update({
      approval_status: "approved",

      approved_by: adminId,

      approved_at: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to approve employer.", error);

  const title = "Your company has been approved";
  const message = `${data.company_name || "Your company"} and its documents have been reviewed and approved. You can now post job orders and search candidates.`;

  const { error: notifyError } = await supabase.from("notifications").insert({
    user_id: employerId,
    user_type: "employer",
    title,
    message,
    type: "employer_approved",
    related_entity: "employer",
    related_entity_id: employerId,
    is_read: false,
  });

  if (notifyError) {
    console.error(`[notifications] Failed to notify employer ${employerId} of approval:`, notifyError);
  }

  if (data.email) {
    await sendEmail({
      to: data.email,
      subject: title,
      message,
      ctaLabel: "Go to Dashboard",
      ctaUrl: `${process.env.FRONTEND_URL ?? ""}/Employer/dashboard`,
    });
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Suspend Employer
|--------------------------------------------------------------------------
*/

export async function suspendEmployer(employerId: string) {
  const { data, error } = await supabase
    .from("employers")
    .update({
      status: "inactive",

      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to suspend employer.", error);

  return data;
}

/*
|--------------------------------------------------------------------------
| Activate Employer
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Employer Documents
|--------------------------------------------------------------------------
*/

export async function getEmployerDocuments(employerId: string) {
  const { data: rawDocuments, error } = await supabase
    .from("employer_documents")
    .select(
      `
        id,
        document_type,
        file_name:name,
        file_url,
        status,
        uploaded_at
      `,
    )
    .eq("employer_id", employerId)
    .order("uploaded_at", { ascending: false });

  if (error) throw new DatabaseError("Unable to fetch employer documents.", error);

  const documents = await Promise.all(
    (rawDocuments ?? []).map(async (doc) => ({
      ...doc,
      file_url: await getSignedDocumentUrl(EMPLOYER_DOCUMENTS_BUCKET, doc.file_url),
    })),
  );

  return documents;
}
export async function activateEmployer(employerId: string) {
  const { data, error } = await supabase
    .from("employers")
    .update({
      status: "active",

      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId)
    .select()
    .single();

  if (error) throw new DatabaseError("Unable to activate employer.", error);

  return data;
}

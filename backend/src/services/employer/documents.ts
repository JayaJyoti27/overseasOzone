import { supabase } from "../../config/supabase";
import { DatabaseError } from "../../utils/AppError";

/*
|--------------------------------------------------------------------------
| Get Company Documents
|--------------------------------------------------------------------------
*/

export async function getEmployerDocuments(employerId: string) {
  const { data, error } = await supabase
    .from("employer_documents")
    .select(
      `
      id,
      document_type,
      name,
      file_url,
      status,
      expiry_date,
      uploaded_at,
      updated_at
    `,
    )
    .eq("employer_id", employerId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new DatabaseError("Unable to fetch company documents.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Upload Company Document
|--------------------------------------------------------------------------
*/

export async function uploadEmployerDocument(
  employerId: string,
  payload: {
    document_type: string;
    file_name: string;
    file_url: string;
  },
) {
  // Upsert on (employer_id, document_type) so a retried/double-submitted
  // upload replaces the previous row for that document type instead of
  // creating a duplicate. Requires a unique constraint on those two columns
  // — see the accompanying migration.
  const { data, error } = await supabase
    .from("employer_documents")
    .upsert(
      {
        employer_id: employerId,
        document_type: payload.document_type,
        name: payload.file_name,
        file_url: payload.file_url,
        status: "pending",
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employer_id,document_type" },
    )
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Unable to upload document: ${error.message}`, error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Delete Company Document
|--------------------------------------------------------------------------
*/

export async function deleteEmployerDocument(employerId: string, documentId: string) {
  const { error } = await supabase
    .from("employer_documents")
    .delete()
    .eq("employer_id", employerId)
    .eq("id", documentId);

  if (error) {
    throw new DatabaseError("Unable to delete document.", error);
  }

  return { success: true };
}

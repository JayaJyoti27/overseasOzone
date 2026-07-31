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
      file_name,
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
  const { data, error } = await supabase
    .from("employer_documents")
    .insert({
      employer_id: employerId,
      document_type: payload.document_type,
      file_name: payload.file_name,
      file_url: payload.file_url,
      status: "pending",
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Unable to upload document: ${error.message}`, error);
  }

  return data;
}

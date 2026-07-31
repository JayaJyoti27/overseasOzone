import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";

/*
|--------------------------------------------------------------------------
| Get Company Profile
|--------------------------------------------------------------------------
*/

export async function getEmployerProfile(employerId: string) {
  const { data, error } = await supabase
    .from("employers")
    .select(
      `
      id,
      company_name,
      contact_person,
      designation,
      email,
      phone,
      website,
      country,
      industry,
      logo_url,
      employee_count,
      head_office,
      license_number,
      license_expiry,
      approval_status,
      status,
      created_at,
      updated_at
    `,
    )
    .eq("id", employerId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Employer profile not found.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Update Company Profile
|--------------------------------------------------------------------------
*/

interface UpdateEmployerProfileDto {
  company_name?: string;
  contact_person?: string;
  designation?: string;
  phone?: string;
  website?: string;
  industry?: string;
  logo_url?: string;
  employee_count?: number;
  head_office?: string;
  verification_doc_url?: string;
}

export async function updateEmployerProfile(employerId: string, payload: UpdateEmployerProfileDto) {
  const { data, error } = await supabase
    .from("employers")
    .upsert(
      {
        id: employerId,
        company_name: payload.company_name,
        contact_person: payload.contact_person,
        designation: payload.designation,
        phone: payload.phone,
        website: payload.website,
        industry: payload.industry,
        logo_url: payload.logo_url,
        employee_count: payload.employee_count,
        head_office: payload.head_office,
        verification_doc_url: payload.verification_doc_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update company profile.", error);
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,
    action: "Company Profile Updated",
    entity: "employer",
    entity_id: employerId,
    metadata: payload,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Upload Company Logo
|--------------------------------------------------------------------------
*/

export async function updateEmployerLogo(employerId: string, logoUrl: string) {
  const { data, error } = await supabase
    .from("employers")
    .update({
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to update company logo.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Submit For Review — notifies every admin that a new employer is waiting
|--------------------------------------------------------------------------
*/

export async function submitEmployerForReview(employerId: string) {
  const { data: employer, error } = await supabase
    .from("employers")
    .select("id, company_name, approval_status")
    .eq("id", employerId)
    .single();

  if (error || !employer) {
    throw new NotFoundError("Employer not found.");
  }

  const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");

  const companyName = employer.company_name || "A new employer";

  for (const admin of admins ?? []) {
    await supabase.from("notifications").insert({
      user_id: admin.id,
      title: "New employer awaiting approval",
      message: `${companyName} has submitted their registration and documents for review.`,
      type: "employer_registration",
      related_entity: "employer",
      related_entity_id: employerId,
      is_read: false,
    });
  }

  return { notified: admins?.length ?? 0 };
}

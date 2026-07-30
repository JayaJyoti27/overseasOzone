import { supabase } from "@/lib/supabase";
import { completeEmployerSignup } from "@/lib/employer/api";

async function handleSubmit(form: typeof defaultEmployerForm) {
  const { error: signUpError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
  });
  if (signUpError) throw new Error(signUpError.message);

  await completeEmployerSignup({
    company_name: form.companyName,
    contact_person: form.contactPerson,
    phone: form.phone,
  });
}

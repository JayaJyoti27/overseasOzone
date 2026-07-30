import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/**
 * Called right after a candidate verifies their OTP for the first time.
 * If they already have a profile, this just confirms it (isNewProfile: false).
 * If not, it creates their profiles row + candidates row and tells the frontend
 * to send them to the "Create Profile" step (isNewProfile: true).
 */
export async function completeCandidateSignup(req: Request, res: Response) {
  try {
    const userId = req.authUserId!;
    const email = req.authUserEmail ?? "";

    const { data: existingProfile, error: lookupError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingProfile) {
      return res.json({
        success: true,
        isNewProfile: false,
        profile: existingProfile,
      });
    }

    // First time we've seen this user — create their profile + candidate record.
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        role: "candidate",
      })
      .select()
      .single();

    if (profileError) throw profileError;

    const { error: candidateError } = await supabase.from("candidates").insert({
      id: userId,
      email,
    });

    if (candidateError) throw candidateError;

    return res.json({
      success: true,
      isNewProfile: true,
      profile: newProfile,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
/**
 * Called right after an employer signs up with email+password.
 * Creates their profiles row + employers row with approval_status "pending".
 * They cannot use the dashboard until Admin approves them.
 */
export async function completeEmployerSignup(req: Request, res: Response) {
  try {
    const userId = req.authUserId!;
    const email = req.authUserEmail ?? "";
    const { company_name, contact_person, phone } = req.body;

    const { data: existingProfile, error: lookupError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingProfile) {
      const { data: employer } = await supabase
        .from("employers")
        .select("approval_status, status")
        .eq("id", userId)
        .single();

      return res.json({
        success: true,
        isNewProfile: false,
        profile: existingProfile,
        approvalStatus: employer?.approval_status ?? "pending",
      });
    }

    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userId, role: "employer" })
      .select()
      .single();

    if (profileError) throw profileError;

    const { error: employerError } = await supabase.from("employers").insert({
      id: userId,
      email,
      company_name: company_name ?? null,
      contact_person: contact_person ?? null,
      phone: phone ?? null,
      approval_status: "pending",
      status: "inactive",
    });

    if (employerError) throw employerError;

    return res.json({
      success: true,
      isNewProfile: true,
      profile: newProfile,
      approvalStatus: "pending",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

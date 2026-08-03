import { supabase } from "../../config/supabase";
import { DatabaseError } from "../../utils/AppError";

export async function getCandidateDashboard(candidateId: string) {
  const applicationIds =
    (await supabase.from("applications").select("id").eq("candidate_id", candidateId)).data?.map(
      (x) => x.id,
    ) ?? [];

  const [
    profileResult,
    applicationsResult,
    interviewsResult,
    offersResult,
    medicalResult,
    visaResult,
    deploymentResult,
    notificationsResult,
    documentsResult,
  ] = await Promise.all([
    supabase.from("candidates").select("*").eq("id", candidateId).single(),

    supabase
      .from("applications")
      .select("*, job:jobs(*)")
      .eq("candidate_id", candidateId)
      .order("applied_at", { ascending: false }),

    supabase.from("interviews").select("*").in("application_id", applicationIds),

    supabase
      .from("offers")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false }),

    supabase
      .from("medicals")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false }),

    supabase
      .from("visas")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false }),

    supabase
      .from("deployments")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false }),

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", candidateId)
      .order("created_at", { ascending: false }),

    supabase.from("documents").select("id, document_type").eq("candidate_id", candidateId),
  ]);

  if (profileResult.error) {
    throw new DatabaseError("Unable to load dashboard.", profileResult.error);
  }

  const candidate = profileResult.data;
  const documents = documentsResult.data ?? [];

  const hasResume = documents.some((d) => d.document_type === "resume");

  const hasArrayValue = (value: unknown) => Array.isArray(value) && value.length > 0;

  // Real `candidates` columns are: name, passport_number, education,
  // experience (see profile.ts's toApiShape comment — the table does NOT
  // have first_name/last_name). education/experience are JSONB arrays
  // defaulting to `[]`, which is truthy in JS, so a plain Boolean() check
  // would wrongly mark an untouched field as complete.
  const sections = {
    personalInfo: Boolean(candidate?.name && candidate?.phone && candidate?.nationality),
    passportDetails: Boolean(candidate?.passport_number),
    education: hasArrayValue(candidate?.education),
    workExperience: hasArrayValue(candidate?.experience),
    resumeUploaded: hasResume,
  };

  const sectionCount = Object.keys(sections).length;
  const completedCount = Object.values(sections).filter(Boolean).length;
  const profileCompletion = Math.round((completedCount / sectionCount) * 100);

  // Keep the stored column in sync, best-effort, same as getProfileCompletion.
  await supabase
    .from("candidates")
    .update({ profile_completion: profileCompletion })
    .eq("id", candidateId);

  const interviews = interviewsResult.data ?? [];
  const offers = offersResult.data ?? [];
  const medicals = medicalResult.data ?? [];
  const visas = visaResult.data ?? [];
  const deployments = deploymentResult.data ?? [];
  const applications = applicationsResult.data ?? [];
  const notifications = notificationsResult.data ?? [];

  const CLOSED_STATUSES = new Set(["rejected", "withdrawn", "deployed"]);
  const activeApplications = applications.filter((a) => !CLOSED_STATUSES.has(a.status)).length;

  const recentActivity = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.message,
    created_at: n.created_at,
  }));

  const upcomingInterview =
    interviews
      .filter((i) => i.status !== "completed")
      .sort(
        (a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime(),
      )[0] ?? null;

  // A brand-new candidate who hasn't touched their profile or uploaded
  // anything yet — used to show a one-time "let's get you set up" nudge.
  const isNewProfile = completedCount === 0 && documents.length === 0;

  return {
    profileCompletion,

    profileSections: sections,

    isNewProfile,

    activeApplications,

    interviews: interviews.length,

    offers: offers.length,

    medicalStatus: medicals[0]?.status ?? "Pending",

    visaStatus: visas[0]?.status ?? "Pending",

    deploymentStatus: deployments[0]?.status ?? "Pending",

    recentActivity,

    recentApplications: applications.slice(0, 5),

    upcomingInterview,

    latestOffer: offers[0] ?? null,

    latestMedical: medicals[0] ?? null,

    latestVisa: visas[0] ?? null,

    latestDeployment: deployments[0] ?? null,

    profile: candidate,
  };
}

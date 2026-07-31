import axios from "axios";
import { supabase } from "@/lib/supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
console.log("VITE_API_URL is:", import.meta.env.VITE_API_URL);

// Attaches the current Supabase session token to every outgoing request,
// same pattern as src/lib/candidate/api.ts.
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

/*
|--------------------------------------------------------------------------
| Signup / Auth
|--------------------------------------------------------------------------
*/

export interface CompleteEmployerSignupResponse {
  success: boolean;
  isNewProfile: boolean;
  profile: { id: string; role: string; full_name: string | null };
}

/** Call right after password signup or magic-link verification — creates the profile+employer row on first login. */
export const completeEmployerSignup = async (): Promise<CompleteEmployerSignupResponse> => {
  const { data } = await api.post("/auth/complete-employer-signup");
  return data;
};

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export async function getDashboard() {
  const response = await api.get("/employer/dashboard");
  console.log("RAW DASHBOARD RESPONSE:", JSON.stringify(response.data, null, 2)); // ADD THIS
  return response.data.data;
}
/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

export async function getProfile() {
  const { data } = await api.get("/employer/profile");
  return data.data;
}

export async function updateProfile(payload: any) {
  const { data } = await api.patch("/employer/profile", payload);
  return data.data;
}

/*
|--------------------------------------------------------------------------
| Requirements
|--------------------------------------------------------------------------
*/

export async function getRequirements(params?: any) {
  const { data } = await api.get("/employer/requirements", {
    params,
  });

  return data.data ?? data;
}

export async function getRequirement(id: string) {
  const { data } = await api.get(`/employer/requirements/${id}`);
  return data.data;
}

export async function createRequirement(payload: any) {
  const { data } = await api.post("/employer/requirements", payload);
  return data.data;
}

export async function updateRequirement(id: string, payload: any) {
  const { data } = await api.patch(`/employer/requirements/${id}`, payload);
  return data.data;
}

export async function withdrawRequirement(id: string) {
  const { data } = await api.patch(`/employer/requirements/${id}/withdraw`);
  return data.data;
}

/*
|--------------------------------------------------------------------------
| Interviews
|--------------------------------------------------------------------------
*/

export async function getInterviews() {
  const { data } = await api.get("/employer/interviews");
  return data.data;
}
export async function confirmInterview(id: string) {
  const { data } = await api.patch(`/employer/interviews/${id}/confirm`);
  return data.data;
}

/*
|--------------------------------------------------------------------------
| Deployments
|--------------------------------------------------------------------------
*/

export async function getDeployments() {
  const { data } = await api.get("/employer/deployments");
  return data.data;
}

export async function getDeployment(id: string) {
  const { data } = await api.get(`/employer/deployments/${id}`);
  return data.data;
}

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

export async function markAllNotificationsRead() {
  const { data } = await api.patch("/employer/notifications/read-all");
  return data.data;
}
export async function getNotifications() {
  const { data } = await api.get("/employer/notifications");
  return data.data;
}

export async function markNotificationRead(id: string) {
  await api.patch(`/employer/notifications/${id}/read`);
}
export async function getCandidates() {
  const { data } = await api.get("/employer/candidates");
  return data.data;
}
export async function uploadEmployerDocument(file: File, documentType: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  const { data } = await api.post("/employer/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function submitForReview() {
  const { data } = await api.post("/employer/submit-for-review");
  return data.data;
}

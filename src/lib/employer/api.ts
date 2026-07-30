import axios from "axios";
import { supabase } from "@/lib/supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

/* =========================================================
   SIGNUP
========================================================= */

export interface CompleteEmployerSignupResponse {
  success: boolean;
  isNewProfile: boolean;
  approvalStatus: "pending" | "approved";
  profile: { id: string; role: string; full_name: string | null };
}

export async function completeEmployerSignup(payload: {
  company_name: string;
  contact_person: string;
  phone: string;
}): Promise<CompleteEmployerSignupResponse> {
  const { data } = await api.post("/auth/complete-employer-signup", payload);
  return data;
}

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

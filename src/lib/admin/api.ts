import axios from "axios";
import { supabase } from "@/lib/supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://172.20.10.3:3001/api",

  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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

// Dashboard
export async function getDashboard() {
  const res = await api.get("/admin/dashboard");
  return res.data.data;
}

// Candidates
export async function getCandidates(params?: Record<string, any>) {
  const res = await api.get("/admin/candidates", { params });
  return res.data.candidates;
}

export async function getCandidate(id: string) {
  const res = await api.get(`/admin/candidates/${id}`);
  const { candidate, applications, documents, resume } = res.data.data;
  return { ...candidate, applications, documents, resume };
}

export async function activateCandidate(id: string) {
  const res = await api.patch(`/admin/candidates/${id}/activate`);
  return res.data.data;
}

export async function suspendCandidate(id: string) {
  const res = await api.patch(`/admin/candidates/${id}/suspend`);
  return res.data.data;
}

// Employers
export async function getEmployers(params?: Record<string, any>) {
  const res = await api.get("/admin/employers", { params });
  return res.data.employers;
}

export async function getEmployer(id: string) {
  const res = await api.get(`/admin/employers/${id}`);
  const { employer, requirements } = res.data.data;
  return { ...employer, requirements };
}

export async function approveEmployer(id: string) {
  const res = await api.patch(`/admin/employers/${id}/approve`);
  return res.data.data;
}

export async function suspendEmployer(id: string) {
  const res = await api.patch(`/admin/employers/${id}/suspend`);
  return res.data.data;
}

export async function activateEmployer(id: string) {
  const res = await api.patch(`/admin/employers/${id}/activate`);
  return res.data.data;
}

// Job Orders
export async function getJobOrders(params?: Record<string, any>) {
  const res = await api.get("/admin/job-orders", { params });
  return res.data.jobOrders;
}

export async function getJobOrder(id: string) {
  const res = await api.get(`/admin/job-orders/${id}`);
  return res.data.data;
}

export async function updateJobOrder(id: string, payload: Record<string, any>) {
  const res = await api.patch(`/admin/job-orders/${id}`, payload);
  return res.data.data;
}

export async function openRecruitment(id: string) {
  const res = await api.patch(`/admin/job-orders/${id}/open`);
  return res.data.data;
}

export async function closeRecruitment(id: string) {
  const res = await api.patch(`/admin/job-orders/${id}/close`);
  return res.data.data;
}

// Requirements
export async function getRequirements(params?: Record<string, any>) {
  const res = await api.get("/admin/requirements", { params });
  return res.data.requirements;
}

export async function getRequirement(id: string) {
  const res = await api.get(`/admin/requirements/${id}`);
  return res.data.data;
}

export async function approveRequirement(id: string) {
  const res = await api.patch(`/admin/requirements/${id}/approve`);
  return res.data.data;
}

export async function rejectRequirement(id: string, reason?: string) {
  const res = await api.patch(`/admin/requirements/${id}/reject`, { reason });
  return res.data.data;
}

export async function requestClarification(id: string, message: string) {
  const res = await api.patch(`/admin/requirements/${id}/clarification`, {
    message,
  });
  return res.data.data;
}

export async function convertRequirement(id: string) {
  const res = await api.patch(`/admin/requirements/${id}/convert`);
  return res.data.data;
}

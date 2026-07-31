import { api } from "./api";

// Dashboard
export async function getDashboard() {
  const res = await api.get("/admin/dashboard");
  return res.data.data;
}

// Candidates
export async function getCandidates(params?: Record<string, any>) {
  const res = await api.get("/admin/candidates", { params });
  return res.data.data;
}

export async function getCandidate(id: string) {
  const res = await api.get(`/admin/candidates/${id}`);
  return res.data.data;
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
  return res.data.data;
}
export async function activateEmployer(id: string) {
  const res = await api.patch(`/admin/employers/${id}/activate`);
  return res.data.data;
}
export async function getEmployer(id: string) {
  const res = await api.get(`/admin/employers/${id}`);
  return res.data.data;
}

export async function getEmployerDocuments(id: string) {
  const res = await api.get(`/admin/employers/${id}/documents`);
  return res.data.data;
}

export async function approveEmployer(id: string) {
  const res = await api.patch(`/admin/employers/${id}/approve`);
  return res.data.data;
}

export async function suspendEmployer(id: string) {
  const res = await api.patch(`/admin/employers/${id}/suspend`);
  return res.data.data;
}

// Job Orders
export async function getJobOrders(params?: Record<string, any>) {
  const res = await api.get("/admin/job-orders", { params });
  return res.data.data;
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

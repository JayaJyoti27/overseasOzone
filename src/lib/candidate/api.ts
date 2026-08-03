import axios from "axios";
import { supabase } from "@/lib/supabase";
import type { CandidateDocument, CandidateJob } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("API baseURL is:", import.meta.env.VITE_API_URL);
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// If the session has actually expired, every page that calls the API would
// otherwise fail independently with its own half-handled error state. Catch
// it once, here, and send the person back to log in instead.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const onAuthPage = window.location.pathname.startsWith("/candidate");
      if (!onAuthPage) {
        window.location.href = "/candidate";
      }
    }
    return Promise.reject(error);
  },
);

/* =========================================================
   SIGNUP / AUTH
========================================================= */

export interface CompleteCandidateSignupResponse {
  success: boolean;
  isNewProfile: boolean;
  profile: { id: string; role: string; full_name: string | null };
}

/** Call right after OTP verification — creates the profile+candidate row on first login. */
export const completeCandidateSignup = async (): Promise<CompleteCandidateSignupResponse> => {
  const { data } = await api.post("/auth/complete-candidate-signup");
  return data;
};

/* =========================================================
   PROFILE
========================================================= */
export const getDashboard = async () => {
  const response = await api.get("/candidate/dashboard");
  return response.data.data ?? null;
};
export const getProfile = async () => {
  const { data } = await api.get("/candidate/profile");
  return data;
};

export const updateProfile = async (payload: any) => {
  const { data } = await api.patch("/candidate/profile", payload);
  return data;
};

/* =========================================================
   JOBS
========================================================= */

export const getJob = async (jobId: string) => {
  const { data } = await api.get(`/candidate/jobs/${jobId}`);
  return data.data ?? null;
};

export const saveJob = async (jobId: string) => {
  const { data } = await api.post(`/candidate/jobs/${jobId}/save`);
  return data;
};

export const removeSavedJob = async (jobId: string) => {
  const { data } = await api.delete(`/candidate/jobs/${jobId}/save`);
  return data;
};

export const getSavedJobs = async () => {
  const { data } = await api.get("/candidate/jobs/saved");
  return data;
};

export const apply = async (jobId: string) => {
  const { data } = await api.post(`/candidate/jobs/${jobId}/apply`);
  return data;
};

/* =========================================================
   APPLICATIONS
========================================================= */

export const getApplication = async (applicationId: string) => {
  const { data } = await api.get(`/candidate/applications/${applicationId}`);
  return data.data ?? null;
};

export const withdrawApplication = async (applicationId: string) => {
  const { data } = await api.patch(`/candidate/applications/${applicationId}/withdraw`);
  return data;
};
export const getApplications = async () => {
  const response = await api.get("/candidate/applications");
  return response.data.applications ?? [];
};

/* =========================================================
   DOCUMENTS
========================================================= */

export const getDocuments = async (): Promise<CandidateDocument[]> => {
  const response = await api.get("/candidate/documents");

  return response.data.data ?? [];
};
export const uploadDocument = async (formData: FormData) => {
  const { data } = await api.post("/candidate/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const deleteDocument = async (documentId: string) => {
  const { data } = await api.delete(`/candidate/documents/${documentId}`);

  return data;
};

/* =========================================================
   INTERVIEWS
========================================================= */

/* =========================================================
   OFFERS
========================================================= */

export const getOffers = async () => {
  const response = await api.get("/candidate/offers");
  return response.data.data ?? [];
};
export const getOffer = async (offerId: string) => {
  const { data } = await api.get(`/candidate/offers/${offerId}`);
  return data;
};

export const acceptOffer = async (offerId: string) => {
  const { data } = await api.patch(`/candidate/offers/${offerId}/accept`);
  return data;
};

export const rejectOffer = async (offerId: string, reason?: string) => {
  const { data } = await api.patch(`/candidate/offers/${offerId}/reject`, { reason });

  return data;
};

/* =========================================================
   MEDICAL
========================================================= */

export const getMedicals = async () => {
  const { data } = await api.get("/candidate/medicals");
  return data;
};

/* =========================================================
   VISA
========================================================= */

export const getVisaStatus = async () => {
  const { data } = await api.get("/candidate/visas");
  return data;
};

/* =========================================================
   DEPLOYMENT
========================================================= */

export const getDeployment = async () => {
  const { data } = await api.get("/candidate/deployments");
  return data;
};

/* =========================================================
   NOTIFICATIONS
========================================================= */

export const getNotifications = async () => {
  const { data } = await api.get("/candidate/notifications");
  return data;
};

export const markNotificationRead = async (notificationId: string) => {
  const { data } = await api.patch(`/candidate/notifications/${notificationId}/read`);

  return data;
};
export const getProfileCompletion = async () => {
  const { data } = await api.get("/candidate/profile/completion");
  return data;
};
export const markAllNotificationsRead = async () => {
  const { data } = await api.patch("/candidate/notifications/read-all");

  return data;
};

/* =========================================================
   DASHBOARD
========================================================= */

import type { CandidateDashboard } from "./types";

export const getInterviews = async () => {
  const response = await api.get("/candidate/interviews");
  return response.data.data ?? [];
};
export const getTimeline = async (applicationId: string) => {
  const { data } = await api.get(`/candidate/applications/${applicationId}/timeline`);
  return data;
};
export const replaceDocument = async (id: string, formData: FormData) => {
  const { data } = await api.patch(`/candidate/documents/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
export const getJobs = async (params?: any) => {
  const { data } = await api.get("/candidate/jobs", { params });
  return data.jobs ?? []; // was returning the whole response body — fixed
};

export const getRecommendedJobs = async (): Promise<CandidateJob[]> => {
  const { data } = await api.get("/candidate/jobs/recommended");
  return data.jobs ?? [];
};
export default api;

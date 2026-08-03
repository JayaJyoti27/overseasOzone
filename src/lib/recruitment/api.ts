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

export const getApplications = async (params?: Record<string, any>) => {
  const { data } = await api.get("/recruitment/applications", { params });
  return data;
};

export const getApplication = async (id: string) => {
  const { data } = await api.get(`/recruitment/applications/${id}`);
  return data.data;
};

export const updateApplicationStage = async (id: string, stage: string, notes?: string) => {
  const { data } = await api.patch(`/recruitment/applications/${id}/stage`, {
    stage,
    notes,
  });

  return data.data;
};

export const assignRecruiter = async (id: string, recruiterId: string) => {
  const { data } = await api.patch(`/recruitment/applications/${id}/assign`, {
    recruiterId,
  });

  return data.data;
};

export const rejectApplication = async (id: string, reason: string) => {
  const { data } = await api.patch(`/recruitment/applications/${id}/reject`, {
    reason,
  });

  return data.data;
};

export const withdrawApplication = async (id: string) => {
  const { data } = await api.patch(`/recruitment/applications/${id}/withdraw`);

  return data.data;
};

export const getTimeline = async (applicationId: string) => {
  const { data } = await api.get(`/recruitment/applications/${applicationId}/timeline`);

  return data.data;
};
export const getDocuments = async (applicationId?: string) => {
  const { data } = await api.get("/recruitment/documents", {
    params: {
      applicationId,
    },
  });

  return data;
};

export const verifyDocument = async (documentId: string) => {
  const { data } = await api.patch(`/recruitment/documents/${documentId}/verify`);

  return data.data;
};

export const rejectDocument = async (documentId: string, reason: string) => {
  const { data } = await api.patch(`/recruitment/documents/${documentId}/reject`, {
    reason,
  });

  return data.data;
};
export const getMedicals = async (applicationId?: string) => {
  const { data } = await api.get("/recruitment/medicals", {
    params: {
      applicationId,
    },
  });

  return data;
};

export const scheduleMedical = async (applicationId: string, payload: any) => {
  const { data } = await api.post(`/recruitment/applications/${applicationId}/medical`, payload);

  return data.data;
};

export const markMedicalFit = async (
  medicalId: string,
  reportDocumentId?: string,
  expiryDate?: string,
) => {
  const { data } = await api.patch(`/recruitment/medicals/${medicalId}/fit`, {
    reportDocumentId,
    expiryDate,
  });

  return data.data;
};

export const markMedicalUnfit = async (medicalId: string, remarks: string) => {
  const { data } = await api.patch(`/recruitment/medicals/${medicalId}/unfit`, {
    remarks,
  });

  return data.data;
};

export const markMedicalRetest = async (medicalId: string, remarks: string) => {
  const { data } = await api.patch(`/recruitment/medicals/${medicalId}/retest`, {
    remarks,
  });

  return data.data;
};
export const getDeployments = async (applicationId?: string) => {
  const { data } = await api.get("/recruitment/deployments", {
    params: {
      applicationId,
    },
  });

  return data;
};

export const createDeployment = async (applicationId: string, payload: any) => {
  const { data } = await api.post(`/recruitment/applications/${applicationId}/deployment`, payload);

  return data.data;
};

export const addTicket = async (deploymentId: string, payload: any) => {
  const { data } = await api.patch(`/recruitment/deployments/${deploymentId}/ticket`, payload);

  return data.data;
};

export const confirmTravel = async (deploymentId: string) => {
  const { data } = await api.patch(`/recruitment/deployments/${deploymentId}/travel-confirmed`);

  return data.data;
};

export const markDeparted = async (deploymentId: string) => {
  const { data } = await api.patch(`/recruitment/deployments/${deploymentId}/departed`);

  return data.data;
};

export const markArrived = async (deploymentId: string) => {
  const { data } = await api.patch(`/recruitment/deployments/${deploymentId}/arrived`);

  return data.data;
};

export const completeDeployment = async (deploymentId: string, remarks: string) => {
  const { data } = await api.patch(`/recruitment/deployments/${deploymentId}/complete`, {
    remarks,
  });

  return data.data;
};
export const getVisas = async (applicationId?: string) => {
  const { data } = await api.get("/recruitment/visas", {
    params: {
      applicationId,
    },
  });

  return data;
};

export const submitVisa = async (applicationId: string, payload: any) => {
  const { data } = await api.post(`/recruitment/applications/${applicationId}/visa`, payload);

  return data.data;
};

export const approveVisa = async (visaId: string) => {
  const { data } = await api.patch(`/recruitment/visas/${visaId}/approve`);

  return data.data;
};

export const issueVisa = async (visaId: string, payload?: any) => {
  const { data } = await api.patch(`/recruitment/visas/${visaId}/issue`, payload);

  return data.data;
};

export const rejectVisa = async (visaId: string, reason: string) => {
  const { data } = await api.patch(`/recruitment/visas/${visaId}/reject`, {
    reason,
  });

  return data.data;
};
export const getInterviews = async (applicationId?: string) => {
  const { data } = await api.get("/recruitment/interviews", {
    params: {
      applicationId,
    },
  });

  return data;
};
export const scheduleInterview = async (applicationId: string, payload: any) => {
  const { data } = await api.post(`/recruitment/applications/${applicationId}/interview`, payload);
  return data.data;
};

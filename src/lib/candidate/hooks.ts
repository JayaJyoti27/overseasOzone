import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import * as api from "./api";
import type { Candidate } from "./types";

type ApiError = AxiosError<{ message?: string }>;

/* ==========================================================
   Query Keys
========================================================== */

export const candidateKeys = {
  dashboard: ["candidate", "dashboard"] as const,

  profile: ["candidate", "profile"] as const,

  jobs: ["candidate", "jobs"] as const,

  applications: ["candidate", "applications"] as const,

  documents: ["candidate", "documents"] as const,

  interviews: ["candidate", "interviews"] as const,

  offers: ["candidate", "offers"] as const,

  medicals: ["candidate", "medicals"] as const,

  visas: ["candidate", "visas"] as const,

  deployments: ["candidate", "deployments"] as const,

  notifications: ["candidate", "notifications"] as const,
};

/* ==========================================================
   Dashboard
========================================================== */

export function useDashboard() {
  return useQuery({
    queryKey: candidateKeys.dashboard,
    queryFn: api.getDashboard,
  });
}

/* ==========================================================
   Profile
========================================================== */

export function useProfile() {
  return useQuery({
    queryKey: candidateKeys.profile,
    queryFn: api.getProfile,
  });
}
export function useRecommendedJobs() {
  return useQuery({
    queryKey: ["candidate", "jobs", "recommended"],
    queryFn: api.getRecommendedJobs,
  });
}
export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Record<keyof Candidate, unknown>>) => api.updateProfile(payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.profile,
      });

      qc.invalidateQueries({
        queryKey: candidateKeys.dashboard,
      });
    },
  });
}

export function useProfileCompletion() {
  return useQuery({
    queryKey: ["candidate", "profile-completion"],

    queryFn: api.getProfileCompletion,
  });
}

/* ==========================================================
   Jobs
========================================================== */

export function useJobs() {
  return useQuery({
    queryKey: candidateKeys.jobs,

    queryFn: api.getJobs,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["candidate", "job", id],

    queryFn: () => api.getJob(id),

    enabled: !!id,
  });
}

export function useSaveJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.saveJob,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.jobs,
      });
    },
  });
}

export function useRemoveSavedJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.removeSavedJob,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.jobs,
      });
    },
  });
}

/* ==========================================================
   Applications
========================================================== */

export function useApplications() {
  return useQuery({
    queryKey: candidateKeys.applications,

    queryFn: api.getApplications,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["candidate", "application", id],

    queryFn: () => api.getApplication(id),

    enabled: !!id,
  });
}

export function useApply() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.apply,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.jobs,
      });

      qc.invalidateQueries({
        queryKey: candidateKeys.applications,
      });

      qc.invalidateQueries({
        queryKey: candidateKeys.dashboard,
      });
    },
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.withdrawApplication,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.applications,
      });

      qc.invalidateQueries({
        queryKey: candidateKeys.dashboard,
      });
    },
  });
}

export function useTimeline(applicationId: string) {
  return useQuery({
    queryKey: ["candidate", "timeline", applicationId],

    queryFn: () => api.getTimeline(applicationId),

    enabled: !!applicationId,
  });
}

/* ==========================================================
   Documents
========================================================== */

export function useDocuments() {
  return useQuery({
    queryKey: candidateKeys.documents,

    queryFn: api.getDocuments,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.uploadDocument,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.documents,
      });
    },
  });
}

export function useReplaceDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.replaceDocument(id, formData),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.documents,
      });
      toast.success("Document replaced.");
    },

    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message ?? "Couldn't replace the document. Try again.");
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.deleteDocument,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.documents,
      });
      toast.success("Document deleted.");
    },

    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message ?? "Couldn't delete the document. Try again.");
    },
  });
}

/* ==========================================================
   Interviews
========================================================== */

export function useInterviews() {
  return useQuery({
    queryKey: candidateKeys.interviews,

    queryFn: api.getInterviews,
  });
}

/* ==========================================================
   Offers
========================================================== */

export interface CandidateOffer {
  id: string;
  application_id: string;
  job_order_id: string;
  employer_id: string;
  candidate_id: string;
  job_title: string | null;
  company_name: string | null;
  salary: number | null;
  currency: string | null;
  contract_duration: string | null;
  joining_date: string | null;
  location: string | null;
  accommodation: boolean;
  transport: boolean;
  food: boolean;
  notes: string | null;
  offer_letter_url: string | null;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "withdrawn" | "expired";
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function useOffers() {
  return useQuery({
    queryKey: candidateKeys.offers,

    queryFn: api.getOffers,
  });
}

export function useAcceptOffer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.acceptOffer,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.offers,
      });
    },
  });
}

export function useRejectOffer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => api.rejectOffer(id, reason),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.offers,
      });
    },
  });
}

/* ==========================================================
   Medical
========================================================== */

export function useMedicals() {
  return useQuery({
    queryKey: candidateKeys.medicals,

    queryFn: api.getMedicals,
  });
}

/* ==========================================================
   Visa
========================================================== */

export function useVisas() {
  return useQuery({
    queryKey: candidateKeys.visas,
    queryFn: api.getVisaStatus,
  });
}

export function useDeployments() {
  return useQuery({
    queryKey: candidateKeys.deployments,
    queryFn: api.getDeployment,
  });
}
/* ============================================================
 * Notifications
 * ============================================================ */

export function useNotifications() {
  return useQuery({
    queryKey: candidateKeys.notifications,
    queryFn: api.getNotifications,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => api.markNotificationRead(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.notifications,
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: candidateKeys.notifications,
      });
    },
  });
}

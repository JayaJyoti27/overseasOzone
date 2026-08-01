import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "./api";

/* ==========================================================
   Query Keys
========================================================== */

export const employerKeys = {
  profile: ["employer", "profile"] as const,

  documents: ["employer", "documents"] as const,
};

/* ==========================================================
   Profile
========================================================== */

export function useEmployerProfile() {
  return useQuery({
    queryKey: employerKeys.profile,
    queryFn: api.getProfile,
  });
}

export function useUpdateEmployerProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.updateProfile(payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employerKeys.profile });
    },
  });
}

/* ==========================================================
   Documents
========================================================== */

export function useEmployerDocuments() {
  return useQuery({
    queryKey: employerKeys.documents,
    queryFn: api.getDocuments,
  });
}

export function useUploadEmployerDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) =>
      api.uploadEmployerDocument(file, documentType),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employerKeys.documents });
    },
  });
}

export function useDeleteEmployerDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteEmployerDocument(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employerKeys.documents });
    },
  });
}

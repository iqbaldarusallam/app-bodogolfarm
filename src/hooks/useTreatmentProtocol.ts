// ─────────────────────────────────────────────────────────
// Treatment Protocol hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProtocols,
  getProtocolsByDisease,
  createProtocol,
  updateProtocol,
  deleteProtocol,
} from '@/services/treatmentProtocol';
import type { UpdateTreatmentProtocolInput } from '@/services/treatmentProtocol';

export function useProtocols() {
  return useQuery({
    queryKey: ['treatment-protocol'],
    queryFn: getProtocols,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProtocolsByDisease(diseaseId: string | null) {
  return useQuery({
    queryKey: ['treatment-protocol', 'disease', diseaseId],
    queryFn: () => getProtocolsByDisease(diseaseId!),
    enabled: !!diseaseId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-protocol'] });
    },
  });
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTreatmentProtocolInput }) =>
      updateProtocol(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-protocol'] });
    },
  });
}

export function useDeleteProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-protocol'] });
    },
  });
}

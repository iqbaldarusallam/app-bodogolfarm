// ─────────────────────────────────────────────────────────
// Vaccination Protocol hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProtocols,
  createProtocol,
  updateProtocol,
  deleteProtocol,
} from '@/services/vaccinationProtocol';
import type { UpdateVaccinationProtocolInput } from '@/services/vaccinationProtocol';

export function useVaccinationProtocols() {
  return useQuery({
    queryKey: ['vaccination-protocol'],
    queryFn: getProtocols,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateVaccinationProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccination-protocol'] });
    },
  });
}

export function useUpdateVaccinationProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVaccinationProtocolInput }) =>
      updateProtocol(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccination-protocol'] });
    },
  });
}

export function useDeleteVaccinationProtocol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccination-protocol'] });
    },
  });
}

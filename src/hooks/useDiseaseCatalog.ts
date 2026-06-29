// ─────────────────────────────────────────────────────────
// Disease Catalog hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDiseases,
  createDisease,
  updateDisease,
  deleteDisease,
} from '@/services/diseaseCatalog';
import type { UpdateDiseaseCatalogInput } from '@/services/diseaseCatalog';

export function useDiseases() {
  return useQuery({
    queryKey: ['disease-catalog'],
    queryFn: getDiseases,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDisease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disease-catalog'] });
    },
  });
}

export function useUpdateDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDiseaseCatalogInput }) =>
      updateDisease(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disease-catalog'] });
    },
  });
}

export function useDeleteDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDisease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disease-catalog'] });
    },
  });
}

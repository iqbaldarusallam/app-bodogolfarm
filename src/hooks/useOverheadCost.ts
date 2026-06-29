// ─────────────────────────────────────────────────────────
// Overhead Cost hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOverheadCosts, getOverheadCostSummary, createOverheadCost, deleteOverheadCost } from '@/services/overheadCost';

export function useOverheadCosts(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['overhead-cost', startDate, endDate],
    queryFn: () => getOverheadCosts(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOverheadCostSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['overhead-cost', 'summary', startDate, endDate],
    queryFn: () => getOverheadCostSummary(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOverheadCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOverheadCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overhead-cost'] });
    },
  });
}

export function useDeleteOverheadCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOverheadCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overhead-cost'] });
    },
  });
}

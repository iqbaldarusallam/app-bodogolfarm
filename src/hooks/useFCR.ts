// ─────────────────────────────────────────────────────────
// FCR hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFCRRecords, getFCRSummary, calculateFCR } from '@/services/fcr';

export function useFCRRecords() {
  return useQuery({
    queryKey: ['fcr'],
    queryFn: getFCRRecords,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFCRSummary() {
  return useQuery({
    queryKey: ['fcr', 'summary'],
    queryFn: getFCRSummary,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCalculateFCR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calculateFCR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fcr'] });
    },
  });
}

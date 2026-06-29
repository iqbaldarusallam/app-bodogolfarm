// ─────────────────────────────────────────────────────────
// Death Loss hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { getDeathLossRecords, getDeathLossSummary } from '@/services/deathLoss';

export function useDeathLossRecords() {
  return useQuery({
    queryKey: ['death-loss'],
    queryFn: getDeathLossRecords,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeathLossSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['death-loss', 'summary', startDate, endDate],
    queryFn: () => getDeathLossSummary(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

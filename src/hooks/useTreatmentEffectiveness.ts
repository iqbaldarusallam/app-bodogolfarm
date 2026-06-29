// ─────────────────────────────────────────────────────────
// Treatment Effectiveness hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { getEffectivenessSummary, getOutcomes } from '@/services/treatmentEffectiveness';

export function useEffectivenessSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['treatment-effectiveness', 'summary', startDate, endDate],
    queryFn: () => getEffectivenessSummary(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTreatmentOutcomes() {
  return useQuery({
    queryKey: ['treatment-effectiveness', 'outcomes'],
    queryFn: getOutcomes,
    staleTime: 5 * 60 * 1000,
  });
}

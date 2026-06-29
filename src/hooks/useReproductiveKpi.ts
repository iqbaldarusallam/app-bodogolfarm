// ─────────────────────────────────────────────────────────
// Reproductive KPI hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { getReproductiveKPI } from '@/services/reproductiveKpi';

export function useReproductiveKPI() {
  return useQuery({
    queryKey: ['reproductive-kpi'],
    queryFn: getReproductiveKPI,
    staleTime: 5 * 60 * 1000,
  });
}

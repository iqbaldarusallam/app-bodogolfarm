// ─────────────────────────────────────────────────────────
// Dashboard hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';

import { getDashboardSummary } from '@/services/dashboard';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 menit
  });
}

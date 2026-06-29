// ─────────────────────────────────────────────────────────
// Early Warning hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActiveAlerts,
  getAlertSummary,
  acknowledgeAlert,
  resolveAlert,
  getAlertHistory,
} from '@/services/earlyWarning';

export function useActiveAlerts() {
  return useQuery({
    queryKey: ['early-warning', 'active'],
    queryFn: getActiveAlerts,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useAlertSummary() {
  return useQuery({
    queryKey: ['early-warning', 'summary'],
    queryFn: getAlertSummary,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['early-warning'] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, notes }: { alertId: string; notes?: string }) =>
      resolveAlert(alertId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['early-warning'] });
    },
  });
}

export function useAlertHistory(status?: string) {
  return useQuery({
    queryKey: ['early-warning', 'history', status],
    queryFn: () => getAlertHistory(status),
    staleTime: 5 * 60 * 1000,
  });
}

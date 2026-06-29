// ─────────────────────────────────────────────────────────
// Farm Checklist hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTodayChecklist,
  completeChecklistItem,
  skipChecklistItem,
  getOverdueChecklists,
} from '@/services/farmChecklist';

export function useTodayChecklist() {
  return useQuery({
    queryKey: ['farm-checklist', 'today'],
    queryFn: getTodayChecklist,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOverdueChecklists() {
  return useQuery({
    queryKey: ['farm-checklist', 'overdue'],
    queryFn: getOverdueChecklists,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checklistId, itemCode }: { checklistId: string; itemCode: string }) =>
      completeChecklistItem(checklistId, itemCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-checklist'] });
    },
  });
}

export function useSkipChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checklistId, itemCode, reason }: { checklistId: string; itemCode: string; reason: string }) =>
      skipChecklistItem(checklistId, itemCode, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-checklist'] });
    },
  });
}

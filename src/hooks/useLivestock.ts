// ─────────────────────────────────────────────────────────
// Livestock hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';

import { getLivestockList, getLivestockById, getLivestockStats, getLivestockTimeline } from '@/services/livestock';
import { getGrowthByLivestock } from '@/services/growth';
import { getActiveFeedMasters, getFeedingByLivestock } from '@/services/feeding';
import { getHealthByLivestock } from '@/services/health';
import { getMedicationByLivestock } from '@/services/medication';
import { getVaccinationByLivestock } from '@/services/vaccination';
import { getPens, getActiveQuarantines } from '@/services/quarantine';
import { getReproductionByLivestock } from '@/services/reproduction';
import type { LivestockQuery } from '@/types/livestock';

export function useLivestockList(query: LivestockQuery = {}) {
  return useQuery({
    queryKey: ['livestock', 'list', query],
    queryFn: () => getLivestockList(query),
    staleTime: 2 * 60 * 1000,
  });
}

export function useLivestockDetail(id: string) {
  return useQuery({
    queryKey: ['livestock', 'detail', id],
    queryFn: () => getLivestockById(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
}

export function useLivestockStats() {
  return useQuery({
    queryKey: ['livestock', 'stats'],
    queryFn: getLivestockStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGrowthByLivestock(livestockId: string) {
  return useQuery({
    queryKey: ['growth', 'livestock', livestockId],
    queryFn: () => getGrowthByLivestock(livestockId),
    staleTime: 2 * 60 * 1000,
    enabled: !!livestockId,
  });
}

export function useActiveFeedMasters() {
  return useQuery({
    queryKey: ['feedMaster', 'active'],
    queryFn: getActiveFeedMasters,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeedingByLivestock(livestockId: string) {
  return useQuery({
    queryKey: ['feeding', 'livestock', livestockId],
    queryFn: () => getFeedingByLivestock(livestockId),
    staleTime: 2 * 60 * 1000,
    enabled: !!livestockId,
  });
}

export function useHealthByLivestock(livestockId: string) {
  return useQuery({
    queryKey: ['health', 'livestock', livestockId],
    queryFn: () => getHealthByLivestock(livestockId),
    staleTime: 2 * 60 * 1000,
    enabled: !!livestockId,
  });
}

export function useMedicationByLivestock(livestockId: string) {
  return useQuery({
    queryKey: ['medication', 'livestock', livestockId],
    queryFn: () => getMedicationByLivestock(livestockId),
    staleTime: 2 * 60 * 1000,
    enabled: !!livestockId,
  });
}

export function useVaccinationByLivestock(livestockId: string) {
  return useQuery({
    queryKey: ['vaccination', 'livestock', livestockId],
    queryFn: () => getVaccinationByLivestock(livestockId),
    staleTime: 2 * 60 * 1000,
    enabled: !!livestockId,
  });
}

export function usePens() {
  return useQuery({
    queryKey: ['pens'],
    queryFn: getPens,
    staleTime: 10 * 60 * 1000,
  });
}

export function useActiveQuarantines() {
  return useQuery({
    queryKey: ['quarantine', 'active'],
    queryFn: getActiveQuarantines,
    staleTime: 2 * 60 * 1000,
  });
}

export function useReproductionByLivestock(livestockId: string) {
  return useQuery({
    queryKey: ['reproduction', 'livestock', livestockId],
    queryFn: () => getReproductionByLivestock(livestockId),
    staleTime: 2 * 60 * 1000,
    enabled: !!livestockId,
  });
}

export function useLivestockTimeline(livestockId: string) {
  return useQuery({
    queryKey: ['livestock', 'timeline', livestockId],
    queryFn: () => getLivestockTimeline(livestockId),
    staleTime: 2 * 60 * 1000,
    enabled: !!livestockId,
  });
}

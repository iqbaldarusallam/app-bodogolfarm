// ─────────────────────────────────────────────────────────
// Reports hooks — React Query
// ─────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import {
  getGrowthReport,
  getHealthReport,
  getFeedingReport,
  getMedicationReport,
  getStatusReport,
  getWithdrawalAlert,
  getVaccinationDue,
  getReproductionReport,
} from '@/services/reports';

export function useGrowthReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'growth', startDate, endDate],
    queryFn: () => getGrowthReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHealthReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'health', startDate, endDate],
    queryFn: () => getHealthReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeedingReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'feeding', startDate, endDate],
    queryFn: () => getFeedingReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMedicationReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'medication', startDate, endDate],
    queryFn: () => getMedicationReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStatusReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'status', startDate, endDate],
    queryFn: () => getStatusReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWithdrawalAlert() {
  return useQuery({
    queryKey: ['reports', 'withdrawal-alert'],
    queryFn: getWithdrawalAlert,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVaccinationDue() {
  return useQuery({
    queryKey: ['reports', 'vaccination-due'],
    queryFn: getVaccinationDue,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReproductionReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'reproduction', startDate, endDate],
    queryFn: () => getReproductionReport(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────
// Dashboard API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { DashboardSummary } from '@/types/dashboard';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<{ success: boolean; data: DashboardSummary }>(
    '/dashboard/summary',
  );
  return data.data;
}

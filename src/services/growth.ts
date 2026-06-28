// ─────────────────────────────────────────────────────────
// Growth API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { CreateGrowthRecordInput, GrowthRecord } from '@/types/growth';

export async function getGrowthByLivestock(livestockId: string): Promise<GrowthRecord[]> {
  const { data } = await api.get<{ success: boolean; data: GrowthRecord[] }>(
    `/growth/livestock/${livestockId}`,
  );
  return data.data;
}

export async function createGrowthRecord(input: CreateGrowthRecordInput): Promise<GrowthRecord> {
  const { data } = await api.post<{ success: boolean; data: GrowthRecord }>('/growth', input);
  return data.data;
}

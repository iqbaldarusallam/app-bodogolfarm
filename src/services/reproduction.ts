// ─────────────────────────────────────────────────────────
// Reproduction API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { CreateReproductionInput, ReproductionRecord } from '@/types/reproduction';

export async function getReproductionByLivestock(livestockId: string): Promise<ReproductionRecord[]> {
  const { data } = await api.get<{ success: boolean; data: ReproductionRecord[] }>(
    `/reproduction/livestock/${livestockId}`,
  );
  return data.data;
}

export async function createReproductionRecord(input: CreateReproductionInput): Promise<ReproductionRecord> {
  const { data } = await api.post<{ success: boolean; data: ReproductionRecord }>('/reproduction', input);
  return data.data;
}

// ─────────────────────────────────────────────────────────
// Health API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { CreateHealthRecordInput, HealthRecord } from '@/types/health';

export async function getHealthByLivestock(livestockId: string): Promise<HealthRecord[]> {
  const { data } = await api.get<{ success: boolean; data: HealthRecord[] }>(
    `/health/livestock/${livestockId}`,
  );
  return data.data;
}

export async function createHealthRecord(input: CreateHealthRecordInput): Promise<HealthRecord> {
  const { data } = await api.post<{ success: boolean; data: HealthRecord }>('/health', input);
  return data.data;
}

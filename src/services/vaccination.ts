// ─────────────────────────────────────────────────────────
// Vaccination API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { CreateVaccinationInput, VaccinationRecord } from '@/types/vaccination';

export async function getVaccinationByLivestock(livestockId: string): Promise<VaccinationRecord[]> {
  const { data } = await api.get<{ success: boolean; data: VaccinationRecord[] }>(
    `/vaccination/livestock/${livestockId}`,
  );
  return data.data;
}

export async function createVaccinationRecord(input: CreateVaccinationInput): Promise<VaccinationRecord> {
  const { data } = await api.post<{ success: boolean; data: VaccinationRecord }>('/vaccination', input);
  return data.data;
}

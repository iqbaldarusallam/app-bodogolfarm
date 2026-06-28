// ─────────────────────────────────────────────────────────
// Medication API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { CreateMedicationLogInput, MedicationLog } from '@/types/medication';

export async function getMedicationByLivestock(livestockId: string): Promise<MedicationLog[]> {
  const { data } = await api.get<{ success: boolean; data: MedicationLog[] }>(
    `/medication/livestock/${livestockId}`,
  );
  return data.data;
}

export async function createMedicationLog(input: CreateMedicationLogInput): Promise<MedicationLog> {
  const { data } = await api.post<{ success: boolean; data: MedicationLog }>('/medication', input);
  return data.data;
}

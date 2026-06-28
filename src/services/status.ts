// ─────────────────────────────────────────────────────────
// Status API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { CreateStatusInput, StatusHistory } from '@/types/status';

export async function createStatusChange(input: CreateStatusInput): Promise<StatusHistory> {
  const { data } = await api.post<{ success: boolean; data: StatusHistory }>('/status', input);
  return data.data;
}

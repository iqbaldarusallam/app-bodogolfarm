// ─────────────────────────────────────────────────────────
// Quarantine & Pen API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { ClearanceTestResult, CreatePenInput, CreateQuarantineInput, Pen, QuarantineRecord } from '@/types/quarantine';

export async function createQuarantine(input: CreateQuarantineInput): Promise<QuarantineRecord> {
  const { data } = await api.post<{ success: boolean; data: QuarantineRecord }>('/quarantine', input);
  return data.data;
}

export async function getActiveQuarantines(): Promise<QuarantineRecord[]> {
  const { data } = await api.get<{ success: boolean; data: QuarantineRecord[] }>('/quarantine/active');
  return data.data;
}

export async function submitClearance(
  quarantineId: string,
  input: { clearance_test_result: ClearanceTestResult; clearance_date: string; notes?: string },
): Promise<QuarantineRecord> {
  const { data } = await api.put<{ success: boolean; data: QuarantineRecord }>(
    `/quarantine/${quarantineId}/clearance`,
    input,
  );
  return data.data;
}

export async function getPens(): Promise<Pen[]> {
  const { data } = await api.get<{ success: boolean; data: Pen[] }>('/pens');
  return data.data;
}

export async function createPen(input: CreatePenInput): Promise<Pen> {
  const { data } = await api.post<{ success: boolean; data: Pen }>('/pens', input);
  return data.data;
}

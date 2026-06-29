// ─────────────────────────────────────────────────────────
// Treatment Effectiveness API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface TreatmentEffectivenessSummary {
  total_treatments: number;
  completed_treatments: number;
  death_count: number;
  top_diagnoses: { diagnosis: string; count: number; treatments: number }[];
  top_medicines: { name: string; count: number }[];
}

export interface TreatmentOutcome {
  livestock: { _id: string; ear_tag: string; name?: string; species: string; breed: string };
  diagnosis: string;
  date: string;
  is_infectious: boolean;
}

/**
 * Get treatment effectiveness summary
 */
export async function getEffectivenessSummary(startDate?: string, endDate?: string): Promise<TreatmentEffectivenessSummary> {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get<{ success: boolean; data: TreatmentEffectivenessSummary }>('/treatment-effectiveness/summary', { params });
  return data.data;
}

/**
 * Get treatment outcomes by livestock
 */
export async function getOutcomes(): Promise<TreatmentOutcome[]> {
  const { data } = await api.get<{ success: boolean; data: TreatmentOutcome[] }>('/treatment-effectiveness/outcomes');
  return data.data;
}

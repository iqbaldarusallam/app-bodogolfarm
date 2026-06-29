// ─────────────────────────────────────────────────────────
// FCR API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface FCRRecord {
  _id: string;
  cage_id: { _id: string; pen_code: string; pen_type: string };
  period_start: string;
  period_end: string;
  period_days: number;
  feed_data: {
    total_feed_kg: number;
    feed_cost_total: number;
    feed_record_count: number;
  };
  weight_data: {
    livestock_count_average: number;
    total_weight_gain_kg: number;
    average_weight_gain_kg_per_head: number;
    average_daily_gain_gram_per_head: number;
  };
  fcr: {
    value: number;
    category: 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient_data';
    is_alert_triggered: boolean;
  };
  is_data_sufficient: boolean;
  calculated_at: string;
}

export interface FCRSummary {
  records: FCRRecord[];
  average_fcr: number;
  alert_count: number;
}

/**
 * Get all FCR records for current farm
 */
export async function getFCRRecords(): Promise<FCRRecord[]> {
  const { data } = await api.get<{ success: boolean; data: FCRRecord[] }>('/fcr');
  return data.data;
}

/**
 * Get FCR summary
 */
export async function getFCRSummary(): Promise<FCRSummary> {
  const { data } = await api.get<{ success: boolean; data: FCRSummary }>('/fcr/summary');
  return data.data;
}

/**
 * Calculate FCR for a cage and period
 */
export async function calculateFCR(input: {
  cage_id: string;
  period_start: string;
  period_end: string;
}): Promise<FCRRecord> {
  const { data } = await api.post<{ success: boolean; data: FCRRecord }>('/fcr/calculate', input);
  return data.data;
}

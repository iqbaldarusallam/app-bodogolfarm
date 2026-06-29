// ─────────────────────────────────────────────────────────
// Death Loss API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface DeathLossSnapshot {
  ear_tag: string;
  name?: string;
  species: string;
  breed: string;
  sex: string;
  age_at_death_days: number;
  last_weight_kg: number;
  last_weight_date: string;
  death_date: string;
  death_cause: string;
  cage_at_death?: string;
}

export interface DeathLossMarketValue {
  price_per_kg_used: number;
  estimated_market_value: number;
  is_market_price_available: boolean;
}

export interface DeathLossInvestment {
  purchase_price: number;
  total_feed_cost: number;
  total_medicine_cost: number;
  total_vaccine_cost: number;
  total_investment: number;
}

export interface DeathLossRecord {
  _id: string;
  livestock_id: { _id: string; ear_tag: string; name?: string; species: string; breed: string };
  snapshot: DeathLossSnapshot;
  market_value_loss: DeathLossMarketValue;
  investment_cost: DeathLossInvestment;
  total_loss: number;
  is_complete_calculation: boolean;
  calculation_notes: string;
  calculated_at: string;
  created_at: string;
}

export interface DeathLossSummary {
  total_count: number;
  total_loss: number;
  total_investment: number;
  total_market_value: number;
  average_loss: number;
  by_cause: { cause: string; count: number }[];
  by_species: { species: string; count: number }[];
}

/**
 * Get all death loss records for current farm
 */
export async function getDeathLossRecords(): Promise<DeathLossRecord[]> {
  const { data } = await api.get<{ success: boolean; data: DeathLossRecord[] }>('/death-loss');
  return data.data;
}

/**
 * Get death loss summary for a period
 */
export async function getDeathLossSummary(startDate?: string, endDate?: string): Promise<DeathLossSummary> {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get<{ success: boolean; data: DeathLossSummary }>('/death-loss/summary', { params });
  return data.data;
}

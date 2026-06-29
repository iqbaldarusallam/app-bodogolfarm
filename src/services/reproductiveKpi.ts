// ─────────────────────────────────────────────────────────
// Reproductive KPI API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface DoePerformance {
  livestock_id: string;
  ear_tag: string;
  name?: string;
  total_breeding_attempts: number;
  total_pregnant: number;
  total_births: number;
  total_kids: number;
  conception_rate: number;
  is_low_performer: boolean;
}

export interface ReproductiveKPI {
  farm_kpi: {
    total_doe: number;
    total_mating: number;
    total_pregnant: number;
    total_births: number;
    total_born_alive: number;
    conception_rate: number;
    kidding_rate: number;
  };
  doe_performance: DoePerformance[];
  low_performers: DoePerformance[];
}

/**
 * Get reproductive KPI
 */
export async function getReproductiveKPI(): Promise<ReproductiveKPI> {
  const { data } = await api.get<{ success: boolean; data: ReproductiveKPI }>('/reproductive-kpi');
  return data.data;
}

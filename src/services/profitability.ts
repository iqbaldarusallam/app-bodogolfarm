// ─────────────────────────────────────────────────────────
// Profitability API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface ProfitabilityResult {
  livestock_id: string;
  ear_tag: string;
  name?: string;
  current_weight_kg: number;
  market_price_per_kg: number;
  estimated_market_value: number;
  purchase_price: number;
  total_feed_cost: number;
  total_medicine_cost: number;
  total_vaccine_cost: number;
  total_investment: number;
  estimated_profit: number;
  profit_margin_percent: number;
  break_even_weight_kg: number;
  is_profitable: boolean;
}

export interface MarketPrice {
  _id: string;
  category: string;
  breed?: string;
  price_per_kg: number;
  currency: string;
  effective_date: string;
  is_active: boolean;
  source?: string;
}

/**
 * Get profitability for all active livestock
 */
export async function getProfitability(): Promise<ProfitabilityResult[]> {
  const { data } = await api.get<{ success: boolean; data: ProfitabilityResult[] }>('/profitability');
  return data.data;
}

/**
 * Get market prices
 */
export async function getMarketPrices(): Promise<MarketPrice[]> {
  const { data } = await api.get<{ success: boolean; data: MarketPrice[] }>('/profitability/market-prices');
  return data.data;
}

/**
 * Set market price
 */
export async function setMarketPrice(input: {
  category: string;
  price_per_kg: number;
  effective_date: string;
  breed?: string;
  source?: string;
  notes?: string;
}): Promise<MarketPrice> {
  const { data } = await api.post<{ success: boolean; data: MarketPrice }>('/profitability/market-prices', input);
  return data.data;
}

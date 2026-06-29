// ─────────────────────────────────────────────────────────
// Overhead Cost API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface OverheadCostItem {
  _id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  allocation_level: 'farm' | 'cage';
  allocated_cage_id?: { _id: string; pen_code: string };
  is_recurring: boolean;
  recurring_frequency?: string;
  next_recurring_date?: string;
  notes?: string;
  created_at: string;
}

export interface OverheadCostSummary {
  total_cost: number;
  by_category: { category: string; amount: number }[];
  count: number;
}

export interface CreateOverheadCostInput {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  allocation_level?: 'farm' | 'cage';
  allocated_cage_id?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
  notes?: string;
}

/**
 * Get all overhead costs
 */
export async function getOverheadCosts(startDate?: string, endDate?: string): Promise<OverheadCostItem[]> {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get<{ success: boolean; data: OverheadCostItem[] }>('/overhead-cost', { params });
  return data.data;
}

/**
 * Get overhead cost summary
 */
export async function getOverheadCostSummary(startDate?: string, endDate?: string): Promise<OverheadCostSummary> {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get<{ success: boolean; data: OverheadCostSummary }>('/overhead-cost/summary', { params });
  return data.data;
}

/**
 * Create new overhead cost
 */
export async function createOverheadCost(input: CreateOverheadCostInput): Promise<OverheadCostItem> {
  const { data } = await api.post<{ success: boolean; data: OverheadCostItem }>('/overhead-cost', input);
  return data.data;
}

/**
 * Delete overhead cost
 */
export async function deleteOverheadCost(id: string): Promise<void> {
  await api.delete(`/overhead-cost/${id}`);
}

// ─────────────────────────────────────────────────────────
// Farm Checklist API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface ChecklistItem {
  item_code: string;
  title: string;
  module_target: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'skipped' | 'overdue';
  completed_by?: string;
  completed_at?: string;
  skipped_reason?: string;
}

export interface FarmChecklist {
  _id: string;
  checklist_type: 'daily' | 'weekly' | 'monthly';
  checklist_date: string;
  items: ChecklistItem[];
  status: 'active' | 'completed' | 'partially_completed';
  completed_at?: string;
}

/**
 * Get today's checklist
 */
export async function getTodayChecklist(): Promise<FarmChecklist> {
  const { data } = await api.get<{ success: boolean; data: FarmChecklist }>('/farm-checklist/today');
  return data.data;
}

/**
 * Complete a checklist item
 */
export async function completeChecklistItem(checklistId: string, itemCode: string): Promise<FarmChecklist> {
  const { data } = await api.put<{ success: boolean; data: FarmChecklist }>(
    `/farm-checklist/${checklistId}/complete/${itemCode}`,
  );
  return data.data;
}

/**
 * Skip a checklist item
 */
export async function skipChecklistItem(checklistId: string, itemCode: string, reason: string): Promise<FarmChecklist> {
  const { data } = await api.put<{ success: boolean; data: FarmChecklist }>(
    `/farm-checklist/${checklistId}/skip/${itemCode}`,
    { reason },
  );
  return data.data;
}

/**
 * Get checklist history
 */
export async function getChecklistHistory(type?: string): Promise<FarmChecklist[]> {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  const { data } = await api.get<{ success: boolean; data: FarmChecklist[] }>('/farm-checklist/history', { params });
  return data.data;
}

/**
 * Get overdue checklists
 */
export async function getOverdueChecklists(): Promise<FarmChecklist[]> {
  const { data } = await api.get<{ success: boolean; data: FarmChecklist[] }>('/farm-checklist/overdue');
  return data.data;
}

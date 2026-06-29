// ─────────────────────────────────────────────────────────
// Early Warning API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface EarlyWarningAlert {
  _id: string;
  rule_code: string;
  priority: 'high' | 'medium' | 'low';
  trigger_entity: 'livestock' | 'cage' | 'farm';
  trigger_livestock_id?: { _id: string; ear_tag: string; name?: string };
  trigger_cage_id?: { _id: string; pen_code: string };
  title: string;
  message: string;
  recommended_action: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'auto_resolved' | 'escalated';
  acknowledged_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  is_escalated: boolean;
  triggered_at: string;
}

export interface AlertSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
  alerts: EarlyWarningAlert[];
}

/**
 * Get active alerts
 */
export async function getActiveAlerts(): Promise<EarlyWarningAlert[]> {
  const { data } = await api.get<{ success: boolean; data: EarlyWarningAlert[] }>('/early-warning/active');
  return data.data;
}

/**
 * Get alert summary
 */
export async function getAlertSummary(): Promise<AlertSummary> {
  const { data } = await api.get<{ success: boolean; data: AlertSummary }>('/early-warning/summary');
  return data.data;
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string): Promise<EarlyWarningAlert> {
  const { data } = await api.put<{ success: boolean; data: EarlyWarningAlert }>(`/early-warning/${alertId}/acknowledge`);
  return data.data;
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: string, notes?: string): Promise<EarlyWarningAlert> {
  const { data } = await api.put<{ success: boolean; data: EarlyWarningAlert }>(`/early-warning/${alertId}/resolve`, { notes });
  return data.data;
}

/**
 * Get alert history
 */
export async function getAlertHistory(status?: string): Promise<EarlyWarningAlert[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const { data } = await api.get<{ success: boolean; data: EarlyWarningAlert[] }>('/early-warning/history', { params });
  return data.data;
}

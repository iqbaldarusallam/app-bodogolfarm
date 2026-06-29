// ─────────────────────────────────────────────────────────
// Treatment Protocol API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface TreatmentProtocolItem {
  _id: string;
  disease_catalog_id: {
    _id: string;
    code: string;
    name: string;
    category: string;
  };
  protocol_name: string;
  severity_level: 'mild' | 'moderate' | 'severe';
  initial_action: string;
  recommended_medicines: string[];
  recommended_dosage_notes: string;
  recommended_duration_days: number;
  quarantine_required: boolean;
  cage_sanitation_action: string;
  vet_escalation_criteria: string;
  follow_up_after_days: number;
  is_active: boolean;
}

export interface CreateTreatmentProtocolInput {
  disease_catalog_id: string;
  protocol_name: string;
  severity_level?: 'mild' | 'moderate' | 'severe';
  initial_action: string;
  recommended_medicines?: string[];
  recommended_dosage_notes?: string;
  recommended_duration_days?: number;
  quarantine_required?: boolean;
  cage_sanitation_action?: string;
  vet_escalation_criteria?: string;
  follow_up_after_days?: number;
}

export interface UpdateTreatmentProtocolInput extends Partial<CreateTreatmentProtocolInput> {
  is_active?: boolean;
}

/**
 * Get all protocols for current farm
 */
export async function getProtocols(): Promise<TreatmentProtocolItem[]> {
  const { data } = await api.get<{ success: boolean; data: TreatmentProtocolItem[] }>('/treatment-protocol');
  return data.data;
}

/**
 * Get protocols by disease
 */
export async function getProtocolsByDisease(diseaseId: string): Promise<TreatmentProtocolItem[]> {
  const { data } = await api.get<{ success: boolean; data: TreatmentProtocolItem[] }>(`/treatment-protocol/disease/${diseaseId}`);
  return data.data;
}

/**
 * Get protocol by ID
 */
export async function getProtocolById(id: string): Promise<TreatmentProtocolItem> {
  const { data } = await api.get<{ success: boolean; data: TreatmentProtocolItem }>(`/treatment-protocol/${id}`);
  return data.data;
}

/**
 * Create new protocol
 */
export async function createProtocol(input: CreateTreatmentProtocolInput): Promise<TreatmentProtocolItem> {
  const { data } = await api.post<{ success: boolean; data: TreatmentProtocolItem }>('/treatment-protocol', input);
  return data.data;
}

/**
 * Update protocol
 */
export async function updateProtocol(id: string, input: UpdateTreatmentProtocolInput): Promise<TreatmentProtocolItem> {
  const { data } = await api.put<{ success: boolean; data: TreatmentProtocolItem }>(`/treatment-protocol/${id}`, input);
  return data.data;
}

/**
 * Delete protocol
 */
export async function deleteProtocol(id: string): Promise<void> {
  await api.delete(`/treatment-protocol/${id}`);
}

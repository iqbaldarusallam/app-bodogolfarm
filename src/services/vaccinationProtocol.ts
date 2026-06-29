// ─────────────────────────────────────────────────────────
// Vaccination Protocol API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface VaccinationProtocolItem {
  _id: string;
  name: string;
  target_disease: string;
  interval_days: number;
  minimum_age_days: number;
  requires_booster: boolean;
  booster_interval_days?: number;
  applicable_gender: 'male' | 'female' | 'all';
  is_active: boolean;
  priority: number;
  notes?: string;
}

export interface CreateVaccinationProtocolInput {
  name: string;
  target_disease: string;
  interval_days: number;
  minimum_age_days?: number;
  requires_booster?: boolean;
  booster_interval_days?: number;
  applicable_gender?: 'male' | 'female' | 'all';
  priority?: number;
  notes?: string;
}

export interface UpdateVaccinationProtocolInput extends Partial<CreateVaccinationProtocolInput> {
  is_active?: boolean;
}

/**
 * Get all vaccination protocols
 */
export async function getProtocols(): Promise<VaccinationProtocolItem[]> {
  const { data } = await api.get<{ success: boolean; data: VaccinationProtocolItem[] }>('/vaccination-protocol');
  return data.data;
}

/**
 * Create new protocol
 */
export async function createProtocol(input: CreateVaccinationProtocolInput): Promise<VaccinationProtocolItem> {
  const { data } = await api.post<{ success: boolean; data: VaccinationProtocolItem }>('/vaccination-protocol', input);
  return data.data;
}

/**
 * Update protocol
 */
export async function updateProtocol(id: string, input: UpdateVaccinationProtocolInput): Promise<VaccinationProtocolItem> {
  const { data } = await api.put<{ success: boolean; data: VaccinationProtocolItem }>(`/vaccination-protocol/${id}`, input);
  return data.data;
}

/**
 * Delete protocol
 */
export async function deleteProtocol(id: string): Promise<void> {
  await api.delete(`/vaccination-protocol/${id}`);
}

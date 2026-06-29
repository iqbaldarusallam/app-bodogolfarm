// ─────────────────────────────────────────────────────────
// Disease Catalog API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export interface DiseaseCatalogItem {
  _id: string;
  code: string;
  name: string;
  category: string;
  common_symptoms: string[];
  severity_default: 'mild' | 'moderate' | 'severe';
  is_contagious: boolean;
  quarantine_recommended: boolean;
  description: string;
  is_active: boolean;
}

export interface CreateDiseaseCatalogInput {
  code: string;
  name: string;
  category: string;
  common_symptoms?: string[];
  severity_default?: 'mild' | 'moderate' | 'severe';
  is_contagious?: boolean;
  quarantine_recommended?: boolean;
  description?: string;
}

export interface UpdateDiseaseCatalogInput extends Partial<CreateDiseaseCatalogInput> {
  is_active?: boolean;
}

/**
 * Get all diseases for current farm
 */
export async function getDiseases(): Promise<DiseaseCatalogItem[]> {
  const { data } = await api.get<{ success: boolean; data: DiseaseCatalogItem[] }>('/disease-catalog');
  return data.data;
}

/**
 * Get disease by ID
 */
export async function getDiseaseById(id: string): Promise<DiseaseCatalogItem> {
  const { data } = await api.get<{ success: boolean; data: DiseaseCatalogItem }>(`/disease-catalog/${id}`);
  return data.data;
}

/**
 * Create new disease
 */
export async function createDisease(input: CreateDiseaseCatalogInput): Promise<DiseaseCatalogItem> {
  const { data } = await api.post<{ success: boolean; data: DiseaseCatalogItem }>('/disease-catalog', input);
  return data.data;
}

/**
 * Update disease
 */
export async function updateDisease(id: string, input: UpdateDiseaseCatalogInput): Promise<DiseaseCatalogItem> {
  const { data } = await api.put<{ success: boolean; data: DiseaseCatalogItem }>(`/disease-catalog/${id}`, input);
  return data.data;
}

/**
 * Delete disease
 */
export async function deleteDisease(id: string): Promise<void> {
  await api.delete(`/disease-catalog/${id}`);
}

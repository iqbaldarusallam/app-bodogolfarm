// ─────────────────────────────────────────────────────────
// Livestock API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { Livestock, LivestockDetail, LivestockListResponse, LivestockQuery, LivestockStats } from '@/types/livestock';

export async function getLivestockList(query: LivestockQuery = {}): Promise<LivestockListResponse> {
  const params: Record<string, string | number> = {};

  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  if (query.status) params.status = query.status;
  if (query.species) params.species = query.species;
  if (query.pen_id) params.pen_id = query.pen_id;
  if (query.search) params.search = query.search;
  if (query.sort) params.sort = query.sort;
  if (query.order) params.order = query.order;

  const { data } = await api.get<{ success: boolean; data: Livestock[]; pagination: LivestockListResponse['pagination'] }>(
    '/livestock',
    { params },
  );

  return { data: data.data, pagination: data.pagination };
}

export async function getLivestockById(id: string): Promise<LivestockDetail> {
  const { data } = await api.get<{ success: boolean; data: LivestockDetail }>(`/livestock/${id}`);
  return data.data;
}

export async function getLivestockStats(): Promise<LivestockStats> {
  const { data } = await api.get<{ success: boolean; data: LivestockStats }>('/livestock/stats');
  return data.data;
}

export async function createLivestock(input: Record<string, unknown>): Promise<Livestock> {
  const { data } = await api.post<{ success: boolean; data: Livestock }>('/livestock', input);
  return data.data;
}

export async function updateLivestock(id: string, input: Record<string, unknown>): Promise<Livestock> {
  const { data } = await api.put<{ success: boolean; data: Livestock }>(`/livestock/${id}`, input);
  return data.data;
}

export async function deleteLivestock(id: string): Promise<void> {
  await api.delete(`/livestock/${id}`);
}

// ── Timeline ──

export interface TimelineItem {
  _id: string;
  type: 'growth' | 'feeding' | 'health' | 'medication' | 'vaccination' | 'quarantine' | 'clearance' | 'reproduction' | 'status';
  date: string;
  title: string;
  summary: string;
  icon: string;
  highlight?: string;
}

export async function getLivestockTimeline(id: string): Promise<TimelineItem[]> {
  const { data } = await api.get<{ success: boolean; data: TimelineItem[] }>(`/livestock/${id}/timeline`);
  return data.data;
}

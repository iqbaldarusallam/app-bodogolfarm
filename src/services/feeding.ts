// ─────────────────────────────────────────────────────────
// Feeding & FeedMaster API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { CreateFeedMasterInput, CreateFeedingLogInput, FeedingLog, FeedMaster } from '@/types/feeding';

export async function getActiveFeedMasters(): Promise<FeedMaster[]> {
  const { data } = await api.get<{ success: boolean; data: FeedMaster[] }>('/feed-master/active');
  return data.data;
}

export async function getFeedingByLivestock(livestockId: string): Promise<FeedingLog[]> {
  const { data } = await api.get<{ success: boolean; data: FeedingLog[] }>(
    `/feeding/livestock/${livestockId}`,
  );
  return data.data;
}

export async function createFeedingLog(input: CreateFeedingLogInput): Promise<FeedingLog> {
  const { data } = await api.post<{ success: boolean; data: FeedingLog }>('/feeding', input);
  return data.data;
}

export async function getAllFeedMasters(): Promise<FeedMaster[]> {
  const { data } = await api.get<{ success: boolean; data: FeedMaster[] }>('/feed-master');
  return data.data;
}

export async function createFeedMaster(input: CreateFeedMasterInput): Promise<FeedMaster> {
  const { data } = await api.post<{ success: boolean; data: FeedMaster }>('/feed-master', input);
  return data.data;
}

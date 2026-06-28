// ─────────────────────────────────────────────────────────
// Auth API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { LoginPayload, LoginResponse, User } from '@/types/auth';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<{ success: boolean; data: LoginResponse }>(
    '/auth/login',
    payload,
  );
  return data.data;
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get<{ success: boolean; data: User }>(
    '/auth/profile',
  );
  return data.data;
}

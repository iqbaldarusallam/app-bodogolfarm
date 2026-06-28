// ─────────────────────────────────────────────────────────
// Users (Kelola Petugas) API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';
import type { User, UserRole } from '@/types/auth';

export interface ManagedUser extends User {
  is_active: boolean;
  created_at?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  farm_id: string;
  is_active?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

export async function getUsers(): Promise<ManagedUser[]> {
  const { data } = await api.get<{ success: boolean; data: ManagedUser[] }>('/users');
  return data.data;
}

export async function createUser(input: CreateUserInput): Promise<ManagedUser> {
  const { data } = await api.post<{ success: boolean; data: ManagedUser }>('/users', input);
  return data.data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<ManagedUser> {
  const { data } = await api.put<{ success: boolean; data: ManagedUser }>(`/users/${id}`, input);
  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

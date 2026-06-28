// ─────────────────────────────────────────────────────────
// Permissions / RBAC helper (mobile) — selaras dgn authorize() backend
// ─────────────────────────────────────────────────────────
// Hierarki: officer (1) < senior_officer (2) < manager (3)
// Gating UI ini HANYA untuk UX (sembunyikan aksi yang tak diizinkan).
// Penegakan sebenarnya tetap di backend (authorize middleware).

import { useAuthStore } from '@/store/auth';
import type { UserRole } from '@/types/auth';

const RANK: Record<UserRole, number> = {
  officer: 1,
  senior_officer: 2,
  manager: 3,
};

export interface Permissions {
  role: UserRole;
  isSeniorUp: boolean;
  isManager: boolean;
  canViewReports: boolean; // laporan = senior+
  canManageMasterData: boolean; // kelola kandang & master pakan = senior+
  canManageUsers: boolean; // kelola petugas = senior+
  canDeleteLivestock: boolean; // hapus ternak = senior+
  canClearQuarantine: boolean; // clearance karantina = senior+
}

export function usePermissions(): Permissions {
  const role = (useAuthStore((s) => s.user?.role) ?? 'officer') as UserRole;
  const rank = RANK[role] ?? 1;
  const isSeniorUp = rank >= 2;
  const isManager = rank >= 3;

  return {
    role,
    isSeniorUp,
    isManager,
    canViewReports: isSeniorUp,
    canManageMasterData: isSeniorUp,
    canManageUsers: isSeniorUp,
    canDeleteLivestock: isSeniorUp,
    canClearQuarantine: isSeniorUp,
  };
}

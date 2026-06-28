// ─────────────────────────────────────────────────────────
// Auth types — sinkron dengan backend validator & service
// ─────────────────────────────────────────────────────────

// Sinkron dengan enum backend (UserRole): officer < senior_officer < manager
export type UserRole = 'officer' | 'senior_officer' | 'manager';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  farm_id: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

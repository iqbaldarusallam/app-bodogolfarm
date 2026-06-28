// ─────────────────────────────────────────────────────────
// Auth types — sinkron dengan backend validator & service
// ─────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'senior_officer' | 'officer' | 'viewer';

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

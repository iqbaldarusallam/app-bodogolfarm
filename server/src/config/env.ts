// ─────────────────────────────────────────────────────────
// Environment configuration
// ─────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

const INSECURE_DEFAULTS = [
  'bodogol-jwt-secret-change-in-production',
  'bodogol-refresh-secret',
];

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`[ENV] Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bodogol',

  // JWT — required in production
  JWT_SECRET: process.env.NODE_ENV === 'production'
    ? requireEnv('JWT_SECRET')
    : (process.env.JWT_SECRET || 'bodogol-jwt-secret-change-in-production'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.NODE_ENV === 'production'
    ? requireEnv('JWT_REFRESH_SECRET')
    : (process.env.JWT_REFRESH_SECRET || 'bodogol-refresh-secret'),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // CORS — explicit origin required in production
  CORS_ORIGIN: process.env.NODE_ENV === 'production'
    ? requireEnv('CORS_ORIGIN')
    : (process.env.CORS_ORIGIN || '*'),
} as const;

// Warn if using insecure defaults in non-production
if (env.NODE_ENV !== 'production') {
  if (INSECURE_DEFAULTS.includes(env.JWT_SECRET)) {
    console.warn('[SECURITY] ⚠ Using default JWT_SECRET — set a strong secret in .env');
  }
}

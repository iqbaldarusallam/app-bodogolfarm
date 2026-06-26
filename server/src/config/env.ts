// ─────────────────────────────────────────────────────────
// Environment configuration
// ─────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bodogol',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'bodogol-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'bodogol-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
} as const;

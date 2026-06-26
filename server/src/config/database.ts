// ─────────────────────────────────────────────────────────
// MongoDB connection configuration
// ─────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    // Opsi koneksi
    const options: mongoose.ConnectOptions = {
      // Auto-index pada production
      autoIndex: env.NODE_ENV !== 'production',
    };

    await mongoose.connect(env.MONGODB_URI, options);

    console.log('┌──────────────────────────────────────────────┐');
    console.log('│  MongoDB Connected Successfully              │');
    console.log('├──────────────────────────────────────────────┤');
    console.log(`│  URI: ${maskUri(env.MONGODB_URI)}`);
    console.log(`│  Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    console.log(`│  Host: ${mongoose.connection.host}`);
    console.log(`│  Port: ${mongoose.connection.port}`);
    console.log('└──────────────────────────────────────────────┘');
  } catch (error) {
    console.error('┌──────────────────────────────────────────────┐');
    console.error('│  MongoDB Connection FAILED                   │');
    console.error('├──────────────────────────────────────────────┤');
    console.error(`│  Error: ${error}`);
    console.error('│                                              │');
    console.error('│  Checklist:                                  │');
    console.error('│  1. MongoDB Atlas cluster sudah dibuat?      │');
    console.error('│  2. IP address sudah di-whitelist?            │');
    console.error('│  3. Username & password benar?                │');
    console.error('│  4. Connection string di .env sudah benar?    │');
    console.error('└──────────────────────────────────────────────┘');
    process.exit(1);
  }

  // Event listeners
  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected. Attempting reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected successfully');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('[DB] MongoDB connection closed (app termination)');
    process.exit(0);
  });
}

// ── Helper: mask password di URI untuk logging ──
function maskUri(uri: string): string {
  try {
    // mongodb+srv://user:password@host/db → mongodb+srv://user:****@host/db
    return uri.replace(/:([^@]+)@/, ':****@');
  } catch {
    return '****';
  }
}

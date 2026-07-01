// ─────────────────────────────────────────────────────────
// MongoDB connection configuration (aman untuk serverless)
// ─────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

// Cache koneksi antar-invocation (penting di serverless: jangan reconnect tiap request).
let connPromise: Promise<typeof mongoose> | null = null;
let listenersAttached = false;

function attachListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB runtime error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

  // SIGINT hanya relevan untuk proses long-running (lokal), bukan serverless.
  if (!process.env.VERCEL) {
    process.once('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  }
}

export async function connectDatabase(): Promise<void> {
  // Sudah terhubung → pakai ulang.
  if (mongoose.connection.readyState === 1) return;

  if (!connPromise) {
    attachListeners();
    connPromise = mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    await connPromise;
    logger.info(
      {
        db: mongoose.connection.db?.databaseName || 'unknown',
        host: mongoose.connection.host,
      },
      'MongoDB connected',
    );
  } catch (error) {
    connPromise = null; // reset agar invocation berikutnya bisa retry
    logger.error({ err: error }, 'MongoDB connection failed');
    // Lokal: matikan proses. Serverless: lempar biar handler balikin 500.
    if (!process.env.VERCEL) process.exit(1);
    throw error;
  }
}

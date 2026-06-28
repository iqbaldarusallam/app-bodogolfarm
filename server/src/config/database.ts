// ─────────────────────────────────────────────────────────
// MongoDB connection configuration
// ─────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  try {
    const options: mongoose.ConnectOptions = {
      autoIndex: env.NODE_ENV !== 'production',
    };

    await mongoose.connect(env.MONGODB_URI, options);

    logger.info({
      db: mongoose.connection.db?.databaseName || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    }, 'MongoDB connected');
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB runtime error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
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

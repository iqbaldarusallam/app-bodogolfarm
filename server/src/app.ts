// ─────────────────────────────────────────────────────────
// Express App Entry Point
// Livestock Recording - Bodogol Farm
// ─────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import { env, connectDatabase } from './config';
import { errorHandler } from './middlewares';

// ── Import Routes ──
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import farmsRoutes from './modules/farms/farms.routes';
import pensRoutes from './modules/pens/pens.routes';
import livestockRoutes from './modules/livestock/livestock.routes';
import growthRoutes from './modules/growth/growth.routes';
import feedMasterRoutes from './modules/feed-master/feed-master.routes';
import feedingRoutes from './modules/feeding/feeding.routes';
import healthRoutes from './modules/health/health.routes';
import medicationRoutes from './modules/medication/medication.routes';
import vaccinationRoutes from './modules/vaccination/vaccination.routes';
import quarantineRoutes from './modules/quarantine/quarantine.routes';
import reproductionRoutes from './modules/reproduction/reproduction.routes';
import statusRoutes from './modules/status/status.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reportsRoutes from './modules/reports/reports.routes';
import syncRoutes from './modules/sync/sync.routes';

// ── Create Express App ──
const app = express();

// ── Global Middleware ──
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Bodogol Livestock API is running',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/farms', farmsRoutes);
app.use('/api/pens', pensRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/feed-master', feedMasterRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/medication', medicationRoutes);
app.use('/api/vaccination', vaccinationRoutes);
app.use('/api/quarantine', quarantineRoutes);
app.use('/api/reproduction', reproductionRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sync', syncRoutes);

// ── 404 Handler ──
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

// ── Global Error Handler ──
app.use(errorHandler);

// ── Start Server ──
async function start() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`[SERVER] Bodogol Livestock API running on port ${env.PORT}`);
    console.log(`[SERVER] Environment: ${env.NODE_ENV}`);
  });
}

start().catch((err) => {
  console.error('[SERVER] Failed to start:', err);
  process.exit(1);
});

export default app;

// ─────────────────────────────────────────────────────────
// Express App Entry Point
// Livestock Recording - Bodogol Farm
// ─────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimitMiddleware from 'express-rate-limit';
import { env, connectDatabase } from './config';
import { logger } from './config/logger';
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
import diseaseCatalogRoutes from './modules/disease-catalog/disease-catalog.routes';
import treatmentProtocolRoutes from './modules/treatment-protocol/treatment-protocol.routes';
import deathLossRoutes from './modules/death-loss/death-loss.routes';
import profitabilityRoutes from './modules/profitability/profitability.routes';
import fcrRoutes from './modules/fcr/fcr.routes';
import farmChecklistRoutes from './modules/farm-checklist/farm-checklist.routes';
import vaccinationProtocolRoutes from './modules/vaccination-protocol/vaccination-protocol.routes';
import overheadCostRoutes from './modules/overhead-cost/overhead-cost.routes';
import earlyWarningRoutes from './modules/early-warning/early-warning.routes';
import treatmentEffectivenessRoutes from './modules/treatment-effectiveness/treatment-effectiveness.routes';
import reproductiveKpiRoutes from './modules/reproductive-kpi/reproductive-kpi.routes';

// ── Create Express App ──
const app = express();

// ── Global Middleware ──
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti' },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints — 20 requests per 15 minutes
const authLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi nanti' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/refresh-token', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ──
app.use((req, _res, next) => {
  logger.debug({ method: req.method, url: req.url }, 'incoming request');
  next();
});

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
app.use('/api/disease-catalog', diseaseCatalogRoutes);
app.use('/api/treatment-protocol', treatmentProtocolRoutes);
app.use('/api/death-loss', deathLossRoutes);
app.use('/api/profitability', profitabilityRoutes);
app.use('/api/fcr', fcrRoutes);
app.use('/api/farm-checklist', farmChecklistRoutes);
app.use('/api/vaccination-protocol', vaccinationProtocolRoutes);
app.use('/api/overhead-cost', overheadCostRoutes);
app.use('/api/early-warning', earlyWarningRoutes);
app.use('/api/treatment-effectiveness', treatmentEffectivenessRoutes);
app.use('/api/reproductive-kpi', reproductiveKpiRoutes);

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
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Bodogol Livestock API started');
  });
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});

export default app;

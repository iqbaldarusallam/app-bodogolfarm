import { Router } from 'express';
import * as reportsController from './reports.controller';
import { authenticate, authorize } from '../../middlewares';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SENIOR_OFFICER, UserRole.MANAGER));

// GET /api/reports/growth
router.get('/growth', reportsController.getGrowthReport);

// GET /api/reports/feeding
router.get('/feeding', reportsController.getFeedingReport);

// GET /api/reports/health
router.get('/health', reportsController.getHealthReport);

// GET /api/reports/medication
router.get('/medication', reportsController.getMedicationReport);

// GET /api/reports/status
router.get('/status', reportsController.getStatusReport);

export default router;

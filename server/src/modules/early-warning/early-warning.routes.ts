import { Router } from 'express';
import * as earlyWarningController from './early-warning.controller';
import { authenticate } from '../../middlewares';

const router = Router();

router.use(authenticate);

// GET /api/early-warning/active
router.get('/active', earlyWarningController.getActiveAlerts);

// GET /api/early-warning/summary
router.get('/summary', earlyWarningController.getAlertSummary);

// GET /api/early-warning/history
router.get('/history', earlyWarningController.getAlertHistory);

// POST /api/early-warning
router.post('/', earlyWarningController.createAlert);

// PUT /api/early-warning/:id/acknowledge
router.put('/:id/acknowledge', earlyWarningController.acknowledgeAlert);

// PUT /api/early-warning/:id/resolve
router.put('/:id/resolve', earlyWarningController.resolveAlert);

export default router;

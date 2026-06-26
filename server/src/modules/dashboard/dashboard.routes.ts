import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { authenticate } from '../../middlewares';

const router = Router();

router.use(authenticate);

// GET /api/dashboard/summary
router.get('/summary', dashboardController.getSummary);

export default router;

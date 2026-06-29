import { Router } from 'express';
import * as farmChecklistController from './farm-checklist.controller';
import { authenticate } from '../../middlewares';

const router = Router();

router.use(authenticate);

// GET /api/farm-checklist/today
router.get('/today', farmChecklistController.getTodayChecklist);

// GET /api/farm-checklist/overdue
router.get('/overdue', farmChecklistController.getOverdue);

// GET /api/farm-checklist/history
router.get('/history', farmChecklistController.getHistory);

// PUT /api/farm-checklist/:checklistId/complete/:itemCode
router.put('/:checklistId/complete/:itemCode', farmChecklistController.completeItem);

// PUT /api/farm-checklist/:checklistId/skip/:itemCode
router.put('/:checklistId/skip/:itemCode', farmChecklistController.skipItem);

export default router;

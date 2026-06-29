import { Router } from 'express';
import * as overheadCostController from './overhead-cost.controller';
import { authenticate, authorize } from '../../middlewares';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/overhead-cost
router.get('/', overheadCostController.getAll);

// GET /api/overhead-cost/summary
router.get('/summary', overheadCostController.getSummary);

// POST /api/overhead-cost
router.post(
  '/',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  overheadCostController.create,
);

// PUT /api/overhead-cost/:id
router.put(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  overheadCostController.update,
);

// DELETE /api/overhead-cost/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  overheadCostController.remove,
);

export default router;

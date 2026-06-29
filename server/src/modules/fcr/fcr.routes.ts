import { Router } from 'express';
import * as fcrController from './fcr.controller';
import { authenticate, authorize } from '../../middlewares';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/fcr
router.get('/', fcrController.getAll);

// GET /api/fcr/summary
router.get('/summary', fcrController.getSummary);

// POST /api/fcr/calculate
router.post(
  '/calculate',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  fcrController.calculate,
);

export default router;

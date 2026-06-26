import { Router } from 'express';
import * as statusController from './status.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import {
  createStatusHistorySchema,
  statusIdParamSchema,
  statusLivestockParamSchema,
} from './status.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/status/livestock/:livestockId
router.get(
  '/livestock/:livestockId',
  validate({ params: statusLivestockParamSchema }),
  statusController.getByLivestock,
);

// GET /api/status/:id
router.get(
  '/:id',
  validate({ params: statusIdParamSchema }),
  statusController.getById,
);

// POST /api/status
router.post(
  '/',
  validate({ body: createStatusHistorySchema }),
  statusController.create,
);

// DELETE /api/status/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: statusIdParamSchema }),
  statusController.remove,
);

export default router;

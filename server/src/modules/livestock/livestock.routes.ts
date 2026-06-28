import { Router } from 'express';
import * as livestockController from './livestock.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import {
  createLivestockSchema,
  updateLivestockSchema,
  livestockIdParamSchema,
  livestockQuerySchema,
} from './livestock.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/livestock/stats
router.get('/stats', livestockController.getStats);

// GET /api/livestock
router.get(
  '/',
  validate({ query: livestockQuerySchema }),
  livestockController.getAll,
);

// PUT /api/livestock/:id/pen — transfer pen
router.put(
  '/:id/pen',
  validate({ params: livestockIdParamSchema }),
  livestockController.transferPen,
);

// GET /api/livestock/:id
router.get(
  '/:id',
  validate({ params: livestockIdParamSchema }),
  livestockController.getById,
);

// GET /api/livestock/:id/timeline
router.get(
  '/:id/timeline',
  validate({ params: livestockIdParamSchema }),
  livestockController.getTimeline,
);

// POST /api/livestock
router.post(
  '/',
  validate({ body: createLivestockSchema }),
  livestockController.create,
);

// PUT /api/livestock/:id
router.put(
  '/:id',
  validate({ params: livestockIdParamSchema, body: updateLivestockSchema }),
  livestockController.update,
);

// DELETE /api/livestock/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ params: livestockIdParamSchema }),
  livestockController.remove,
);

export default router;

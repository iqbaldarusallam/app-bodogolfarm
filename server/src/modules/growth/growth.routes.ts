import { Router } from 'express';
import * as growthController from './growth.controller';
import { validate, authenticate } from '../../middlewares';
import {
  createGrowthRecordSchema,
  updateGrowthRecordSchema,
  growthIdParamSchema,
  growthLivestockParamSchema,
} from './growth.validator';

const router = Router();

router.use(authenticate);

// GET /api/growth/livestock/:livestockId
router.get(
  '/livestock/:livestockId',
  validate({ params: growthLivestockParamSchema }),
  growthController.getByLivestock,
);

// GET /api/growth/:id
router.get(
  '/:id',
  validate({ params: growthIdParamSchema }),
  growthController.getById,
);

// POST /api/growth
router.post(
  '/',
  validate({ body: createGrowthRecordSchema }),
  growthController.create,
);

// PUT /api/growth/:id
router.put(
  '/:id',
  validate({ params: growthIdParamSchema, body: updateGrowthRecordSchema }),
  growthController.update,
);

// DELETE /api/growth/:id
router.delete(
  '/:id',
  validate({ params: growthIdParamSchema }),
  growthController.remove,
);

export default router;

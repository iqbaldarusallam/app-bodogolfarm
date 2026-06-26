import { Router } from 'express';
import * as feedingController from './feeding.controller';
import { validate, authenticate } from '../../middlewares';
import {
  createFeedingLogSchema,
  updateFeedingLogSchema,
  feedingIdParamSchema,
  feedingLivestockParamSchema,
} from './feeding.validator';

const router = Router();

router.use(authenticate);

// GET /api/feeding/livestock/:livestockId
router.get(
  '/livestock/:livestockId',
  validate({ params: feedingLivestockParamSchema }),
  feedingController.getByLivestock,
);

// GET /api/feeding/:id
router.get(
  '/:id',
  validate({ params: feedingIdParamSchema }),
  feedingController.getById,
);

// POST /api/feeding
router.post(
  '/',
  validate({ body: createFeedingLogSchema }),
  feedingController.create,
);

// PUT /api/feeding/:id
router.put(
  '/:id',
  validate({ params: feedingIdParamSchema, body: updateFeedingLogSchema }),
  feedingController.update,
);

// DELETE /api/feeding/:id
router.delete(
  '/:id',
  validate({ params: feedingIdParamSchema }),
  feedingController.remove,
);

export default router;

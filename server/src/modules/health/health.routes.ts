import { Router } from 'express';
import * as healthController from './health.controller';
import { validate, authenticate } from '../../middlewares';
import {
  createHealthRecordSchema,
  updateHealthRecordSchema,
  healthIdParamSchema,
  healthLivestockParamSchema,
} from './health.validator';

const router = Router();

router.use(authenticate);

// GET /api/health/infectious
router.get('/infectious', healthController.getInfectious);

// GET /api/health/follow-ups
router.get('/follow-ups', healthController.getFollowUps);

// GET /api/health/livestock/:livestockId
router.get(
  '/livestock/:livestockId',
  validate({ params: healthLivestockParamSchema }),
  healthController.getByLivestock,
);

// GET /api/health/:id
router.get(
  '/:id',
  validate({ params: healthIdParamSchema }),
  healthController.getById,
);

// POST /api/health
router.post(
  '/',
  validate({ body: createHealthRecordSchema }),
  healthController.create,
);

// PUT /api/health/:id
router.put(
  '/:id',
  validate({ params: healthIdParamSchema, body: updateHealthRecordSchema }),
  healthController.update,
);

// DELETE /api/health/:id
router.delete(
  '/:id',
  validate({ params: healthIdParamSchema }),
  healthController.remove,
);

export default router;

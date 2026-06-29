import { Router } from 'express';
import * as treatmentProtocolController from './treatment-protocol.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import {
  createTreatmentProtocolSchema,
  updateTreatmentProtocolSchema,
  treatmentProtocolIdParamSchema,
} from './treatment-protocol.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/treatment-protocol
router.get('/', treatmentProtocolController.getAll);

// GET /api/treatment-protocol/disease/:diseaseId
router.get('/disease/:diseaseId', treatmentProtocolController.getByDisease);

// GET /api/treatment-protocol/:id
router.get(
  '/:id',
  validate({ params: treatmentProtocolIdParamSchema }),
  treatmentProtocolController.getById,
);

// POST /api/treatment-protocol
router.post(
  '/',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ body: createTreatmentProtocolSchema }),
  treatmentProtocolController.create,
);

// PUT /api/treatment-protocol/:id
router.put(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ params: treatmentProtocolIdParamSchema, body: updateTreatmentProtocolSchema }),
  treatmentProtocolController.update,
);

// DELETE /api/treatment-protocol/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: treatmentProtocolIdParamSchema }),
  treatmentProtocolController.remove,
);

export default router;

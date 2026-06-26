import { Router } from 'express';
import * as medicationController from './medication.controller';
import { validate, authenticate } from '../../middlewares';
import {
  createMedicationLogSchema,
  updateMedicationLogSchema,
  medicationIdParamSchema,
} from './medication.validator';

const router = Router();

router.use(authenticate);

// GET /api/medication/withdrawals/active
router.get('/withdrawals/active', medicationController.getActiveWithdrawals);

// GET /api/medication/livestock/:livestockId
router.get('/livestock/:livestockId', medicationController.getByLivestock);

// GET /api/medication/:id
router.get(
  '/:id',
  validate({ params: medicationIdParamSchema }),
  medicationController.getById,
);

// POST /api/medication
router.post(
  '/',
  validate({ body: createMedicationLogSchema }),
  medicationController.create,
);

// PUT /api/medication/:id
router.put(
  '/:id',
  validate({ params: medicationIdParamSchema, body: updateMedicationLogSchema }),
  medicationController.update,
);

// DELETE /api/medication/:id
router.delete(
  '/:id',
  validate({ params: medicationIdParamSchema }),
  medicationController.remove,
);

export default router;

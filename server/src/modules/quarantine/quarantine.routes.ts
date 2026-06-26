import { Router } from 'express';
import * as quarantineController from './quarantine.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import {
  createQuarantineRecordSchema,
  updateQuarantineRecordSchema,
  clearanceSchema,
  quarantineIdParamSchema,
} from './quarantine.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/quarantine/active
router.get('/active', quarantineController.getActive);

// GET /api/quarantine
router.get('/', quarantineController.getAll);

// GET /api/quarantine/:id
router.get(
  '/:id',
  validate({ params: quarantineIdParamSchema }),
  quarantineController.getById,
);

// POST /api/quarantine
router.post(
  '/',
  validate({ body: createQuarantineRecordSchema }),
  quarantineController.create,
);

// PUT /api/quarantine/:id
router.put(
  '/:id',
  validate({ params: quarantineIdParamSchema, body: updateQuarantineRecordSchema }),
  quarantineController.update,
);

// PUT /api/quarantine/:id/clearance
router.put(
  '/:id/clearance',
  authorize(UserRole.SENIOR_OFFICER, UserRole.MANAGER),
  validate({ params: quarantineIdParamSchema, body: clearanceSchema }),
  quarantineController.clearance,
);

// DELETE /api/quarantine/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: quarantineIdParamSchema }),
  quarantineController.remove,
);

export default router;

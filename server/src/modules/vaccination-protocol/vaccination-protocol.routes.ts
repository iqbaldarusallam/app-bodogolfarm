import { Router } from 'express';
import * as vaccinationProtocolController from './vaccination-protocol.controller';
import { authenticate, authorize } from '../../middlewares';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/vaccination-protocol
router.get('/', vaccinationProtocolController.getAll);

// GET /api/vaccination-protocol/:id
router.get('/:id', vaccinationProtocolController.getById);

// POST /api/vaccination-protocol
router.post(
  '/',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  vaccinationProtocolController.create,
);

// PUT /api/vaccination-protocol/:id
router.put(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  vaccinationProtocolController.update,
);

// DELETE /api/vaccination-protocol/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  vaccinationProtocolController.remove,
);

export default router;

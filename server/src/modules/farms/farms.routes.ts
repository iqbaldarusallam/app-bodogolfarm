import { Router } from 'express';
import * as farmsController from './farms.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import { createFarmSchema, updateFarmSchema, farmIdParamSchema } from './farms.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/farms
router.get('/', farmsController.getAll);

// GET /api/farms/:id
router.get(
  '/:id',
  validate({ params: farmIdParamSchema }),
  farmsController.getById,
);

// POST /api/farms (manager only)
router.post(
  '/',
  authorize(UserRole.MANAGER),
  validate({ body: createFarmSchema }),
  farmsController.create,
);

// PUT /api/farms/:id (manager only)
router.put(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: farmIdParamSchema, body: updateFarmSchema }),
  farmsController.update,
);

// DELETE /api/farms/:id (manager only)
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: farmIdParamSchema }),
  farmsController.remove,
);

export default router;

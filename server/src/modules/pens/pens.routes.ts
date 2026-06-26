import { Router } from 'express';
import * as pensController from './pens.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import { createPenSchema, updatePenSchema, penIdParamSchema } from './pens.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/pens
router.get('/', pensController.getAll);

// GET /api/pens/type/:type
router.get('/type/:type', pensController.getByType);

// GET /api/pens/:id
router.get(
  '/:id',
  validate({ params: penIdParamSchema }),
  pensController.getById,
);

// POST /api/pens
router.post(
  '/',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ body: createPenSchema }),
  pensController.create,
);

// PUT /api/pens/:id
router.put(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ params: penIdParamSchema, body: updatePenSchema }),
  pensController.update,
);

// DELETE /api/pens/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: penIdParamSchema }),
  pensController.remove,
);

export default router;

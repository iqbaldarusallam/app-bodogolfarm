import { Router } from 'express';
import * as usersController from './users.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import { createUserSchema, updateUserSchema, userIdParamSchema } from './users.validator';
import { UserRole } from '../../types/enums';

const router = Router();

// Semua route butuh autentikasi
router.use(authenticate);

// GET /api/users
router.get('/', usersController.getAll);

// GET /api/users/:id
router.get(
  '/:id',
  validate({ params: userIdParamSchema }),
  usersController.getById,
);

// POST /api/users (manager only)
router.post(
  '/',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ body: createUserSchema }),
  usersController.create,
);

// PUT /api/users/:id (manager only)
router.put(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  usersController.update,
);

// DELETE /api/users/:id (manager only)
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: userIdParamSchema }),
  usersController.remove,
);

export default router;

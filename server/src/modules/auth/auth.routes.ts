import { Router } from 'express';
import * as authController from './auth.controller';
import { validate, authenticate } from '../../middlewares';
import { loginSchema, registerSchema, changePasswordSchema } from './auth.validator';

const router = Router();

// POST /api/auth/login
router.post(
  '/login',
  validate({ body: loginSchema }),
  authController.login,
);

// POST /api/auth/register
router.post(
  '/register',
  validate({ body: registerSchema }),
  authController.register,
);

// GET /api/auth/profile
router.get(
  '/profile',
  authenticate,
  authController.getProfile,
);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

// POST /api/auth/refresh-token
router.post(
  '/refresh-token',
  authController.refreshToken,
);

export default router;

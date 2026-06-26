// ─────────────────────────────────────────────────────────
// JWT authentication middleware
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { AppError } from './error-handler';
import { UserRole } from '../types/enums';

// ── Extend Express Request ──
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    farm_id: string;
  };
}

// ── JWT Payload ──
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  farm_id: string;
}

// ── Authenticate ──
export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token autentikasi tidak ditemukan', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new AppError('Token tidak valid atau sudah kedaluwarsa', 401);
  }
}

// ── Authorize by role ──
export function authorize(...roles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      throw new AppError('Autentikasi diperlukan', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Role ${req.user.role} tidak memiliki akses ke resource ini`,
        403,
      );
    }

    next();
  };
}

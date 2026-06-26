import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as authService from './auth.service';

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.changePassword(req.user!.userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshToken(req.body.refresh_token);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

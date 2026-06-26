import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as farmsService from './farms.service';

export async function getAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farms = await farmsService.getAll();
    res.status(200).json({ success: true, data: farms });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farm = await farmsService.getById(req.params.id);
    res.status(200).json({ success: true, data: farm });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farm = await farmsService.create(req.body);
    res.status(201).json({ success: true, data: farm });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farm = await farmsService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: farm });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await farmsService.remove(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

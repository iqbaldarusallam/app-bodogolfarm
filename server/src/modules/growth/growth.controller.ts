import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as growthService from './growth.service';

export async function getByLivestock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const records = await growthService.getByLivestock(req.params.livestockId);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await growthService.getById(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await growthService.create(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await growthService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await growthService.remove(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

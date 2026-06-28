import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as feedingService from './feeding.service';

export async function getByLivestock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const logs = await feedingService.getByLivestock(req.params.livestockId as string);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const log = await feedingService.getById(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const log = await feedingService.create(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const log = await feedingService.update(req.params.id as string, req.body, req.user!.farm_id);
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await feedingService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

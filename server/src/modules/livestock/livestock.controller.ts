import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as livestockService from './livestock.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await livestockService.getAll(req.user!.farm_id, req.query as any);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const livestock = await livestockService.getById(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const livestock = await livestockService.create(req.body, req.user!.userId, req.user!.farm_id);
    res.status(201).json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const livestock = await livestockService.update(req.params.id as string, req.body, req.user!.farm_id);
    res.status(200).json({ success: true, data: livestock });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await livestockService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const timeline = await livestockService.getTimeline(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const stats = await livestockService.getStats(req.user!.farm_id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function transferPen(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await livestockService.transferPen(
      req.params.id as string,
      req.body.pen_id as string,
      req.user!.farm_id,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

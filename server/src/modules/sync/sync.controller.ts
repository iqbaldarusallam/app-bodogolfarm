import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as syncService from './sync.service';

export async function getPending(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const queue = await syncService.getPending();
    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
}

export async function pushToQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const item = await syncService.pushToQueue(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function markSynced(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const item = await syncService.markSynced(req.params.id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function markFailed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const item = await syncService.markFailed(req.params.id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const stats = await syncService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function retryFailed(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await syncService.retryFailed();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

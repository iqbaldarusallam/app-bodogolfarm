import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as medicationService from './medication.service';

export async function getByLivestock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const logs = await medicationService.getByLivestock(req.params.livestockId);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const log = await medicationService.getById(req.params.id);
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const log = await medicationService.create(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const log = await medicationService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await medicationService.remove(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getActiveWithdrawals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const logs = await medicationService.getActiveWithdrawals(req.user!.farm_id);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

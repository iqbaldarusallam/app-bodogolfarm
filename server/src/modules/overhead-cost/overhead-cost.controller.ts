import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as overheadCostService from './overhead-cost.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const result = await overheadCostService.getAll(req.user!.farm_id, start_date as string, end_date as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const result = await overheadCostService.getSummary(req.user!.farm_id, start_date as string, end_date as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await overheadCostService.create(req.body, req.user!.userId, req.user!.farm_id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await overheadCostService.update(req.params.id as string, req.body, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await overheadCostService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

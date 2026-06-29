import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as fcrService from './fcr.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await fcrService.getAll(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await fcrService.getSummary(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function calculate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { cage_id, period_start, period_end } = req.body;
    const result = await fcrService.calculateFCR(
      cage_id,
      new Date(period_start),
      new Date(period_end),
      req.user!.farm_id,
      req.user!.userId,
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as dashboardService from './dashboard.service';

export async function getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const summary = await dashboardService.getSummary(req.user!.farm_id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}

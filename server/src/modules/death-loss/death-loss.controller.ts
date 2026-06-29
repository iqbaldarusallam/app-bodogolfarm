import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as deathLossService from './death-loss.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await deathLossService.getAll(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const result = await deathLossService.getSummary(
      req.user!.farm_id,
      start_date as string,
      end_date as string,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

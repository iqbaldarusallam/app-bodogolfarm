import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as reproductiveKpiService from './reproductive-kpi.service';

export async function getKPI(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await reproductiveKpiService.getReproductiveKPI(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

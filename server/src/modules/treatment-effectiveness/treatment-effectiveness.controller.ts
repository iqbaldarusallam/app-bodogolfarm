import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as treatmentEffectivenessService from './treatment-effectiveness.service';

export async function getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const result = await treatmentEffectivenessService.getEffectivenessSummary(
      req.user!.farm_id,
      start_date as string,
      end_date as string,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getOutcomes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await treatmentEffectivenessService.getOutcomesByLivestock(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

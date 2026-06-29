import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as profitabilityService from './profitability.service';

export async function getProfitability(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await profitabilityService.calculateAllProfitability(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMarketPrices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await profitabilityService.getMarketPrices(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function setMarketPrice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { category, price_per_kg, effective_date, breed, source, notes } = req.body;
    const result = await profitabilityService.setMarketPrice(
      req.user!.farm_id,
      category,
      price_per_kg,
      new Date(effective_date),
      req.user!.userId,
      { breed, source, notes },
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

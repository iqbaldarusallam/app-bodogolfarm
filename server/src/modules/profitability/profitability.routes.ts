import { Router } from 'express';
import * as profitabilityController from './profitability.controller';
import { authenticate, authorize } from '../../middlewares';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/profitability
router.get('/', profitabilityController.getProfitability);

// GET /api/profitability/market-prices
router.get('/market-prices', profitabilityController.getMarketPrices);

// POST /api/profitability/market-prices
router.post(
  '/market-prices',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  profitabilityController.setMarketPrice,
);

export default router;

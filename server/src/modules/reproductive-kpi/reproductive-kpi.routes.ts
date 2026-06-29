import { Router } from 'express';
import * as reproductiveKpiController from './reproductive-kpi.controller';
import { authenticate } from '../../middlewares';

const router = Router();

router.use(authenticate);

// GET /api/reproductive-kpi
router.get('/', reproductiveKpiController.getKPI);

export default router;

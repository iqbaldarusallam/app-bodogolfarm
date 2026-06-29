import { Router } from 'express';
import * as treatmentEffectivenessController from './treatment-effectiveness.controller';
import { authenticate } from '../../middlewares';

const router = Router();

router.use(authenticate);

// GET /api/treatment-effectiveness/summary
router.get('/summary', treatmentEffectivenessController.getSummary);

// GET /api/treatment-effectiveness/outcomes
router.get('/outcomes', treatmentEffectivenessController.getOutcomes);

export default router;

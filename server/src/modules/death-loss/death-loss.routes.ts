import { Router } from 'express';
import * as deathLossController from './death-loss.controller';
import { authenticate } from '../../middlewares';

const router = Router();

router.use(authenticate);

// GET /api/death-loss
router.get('/', deathLossController.getAll);

// GET /api/death-loss/summary
router.get('/summary', deathLossController.getSummary);

export default router;

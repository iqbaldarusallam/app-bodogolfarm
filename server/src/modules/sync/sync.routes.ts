import { Router } from 'express';
import * as syncController from './sync.controller';
import { authenticate } from '../../middlewares';

const router = Router();

router.use(authenticate);

// GET /api/sync/pending
router.get('/pending', syncController.getPending);

// GET /api/sync/stats
router.get('/stats', syncController.getStats);

// POST /api/sync/push
router.post('/push', syncController.pushToQueue);

// PUT /api/sync/:id/synced
router.put('/:id/synced', syncController.markSynced);

// PUT /api/sync/:id/failed
router.put('/:id/failed', syncController.markFailed);

// POST /api/sync/retry-failed
router.post('/retry-failed', syncController.retryFailed);

export default router;

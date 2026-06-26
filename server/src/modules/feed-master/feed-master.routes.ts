import { Router } from 'express';
import * as feedMasterController from './feed-master.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import {
  createFeedMasterSchema,
  updateFeedMasterSchema,
  feedMasterIdParamSchema,
} from './feed-master.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/feed-master
router.get('/', feedMasterController.getAll);

// GET /api/feed-master/active
router.get('/active', feedMasterController.getActive);

// GET /api/feed-master/:id
router.get(
  '/:id',
  validate({ params: feedMasterIdParamSchema }),
  feedMasterController.getById,
);

// POST /api/feed-master
router.post(
  '/',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ body: createFeedMasterSchema }),
  feedMasterController.create,
);

// PUT /api/feed-master/:id
router.put(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ params: feedMasterIdParamSchema, body: updateFeedMasterSchema }),
  feedMasterController.update,
);

// DELETE /api/feed-master/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: feedMasterIdParamSchema }),
  feedMasterController.remove,
);

export default router;

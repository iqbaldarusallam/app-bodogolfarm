import { Router } from 'express';
import * as reproductionController from './reproduction.controller';
import { validate, authenticate } from '../../middlewares';
import {
  createReproductionRecordSchema,
  updateReproductionRecordSchema,
  reproductionIdParamSchema,
} from './reproduction.validator';

const router = Router();

router.use(authenticate);

// GET /api/reproduction/pregnancies
router.get('/pregnancies', reproductionController.getPregnancies);

// GET /api/reproduction/livestock/:livestockId
router.get('/livestock/:livestockId', reproductionController.getByLivestock);

// GET /api/reproduction/:id
router.get(
  '/:id',
  validate({ params: reproductionIdParamSchema }),
  reproductionController.getById,
);

// POST /api/reproduction
router.post(
  '/',
  validate({ body: createReproductionRecordSchema }),
  reproductionController.create,
);

// PUT /api/reproduction/:id
router.put(
  '/:id',
  validate({ params: reproductionIdParamSchema, body: updateReproductionRecordSchema }),
  reproductionController.update,
);

// DELETE /api/reproduction/:id
router.delete(
  '/:id',
  validate({ params: reproductionIdParamSchema }),
  reproductionController.remove,
);

export default router;

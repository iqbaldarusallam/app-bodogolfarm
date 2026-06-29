import { Router } from 'express';
import * as diseaseCatalogController from './disease-catalog.controller';
import { validate, authenticate, authorize } from '../../middlewares';
import {
  createDiseaseCatalogSchema,
  updateDiseaseCatalogSchema,
  diseaseCatalogIdParamSchema,
} from './disease-catalog.validator';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(authenticate);

// GET /api/disease-catalog
router.get('/', diseaseCatalogController.getAll);

// GET /api/disease-catalog/:id
router.get(
  '/:id',
  validate({ params: diseaseCatalogIdParamSchema }),
  diseaseCatalogController.getById,
);

// POST /api/disease-catalog
router.post(
  '/',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ body: createDiseaseCatalogSchema }),
  diseaseCatalogController.create,
);

// PUT /api/disease-catalog/:id
router.put(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.SENIOR_OFFICER),
  validate({ params: diseaseCatalogIdParamSchema, body: updateDiseaseCatalogSchema }),
  diseaseCatalogController.update,
);

// DELETE /api/disease-catalog/:id
router.delete(
  '/:id',
  authorize(UserRole.MANAGER),
  validate({ params: diseaseCatalogIdParamSchema }),
  diseaseCatalogController.remove,
);

export default router;

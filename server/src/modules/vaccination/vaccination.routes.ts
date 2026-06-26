import { Router } from 'express';
import * as vaccinationController from './vaccination.controller';
import { validate, authenticate } from '../../middlewares';
import {
  createVaccinationRecordSchema,
  updateVaccinationRecordSchema,
  vaccinationIdParamSchema,
} from './vaccination.validator';

const router = Router();

router.use(authenticate);

// GET /api/vaccination/boosters/upcoming
router.get('/boosters/upcoming', vaccinationController.getUpcomingBoosters);

// GET /api/vaccination/livestock/:livestockId
router.get('/livestock/:livestockId', vaccinationController.getByLivestock);

// GET /api/vaccination/:id
router.get(
  '/:id',
  validate({ params: vaccinationIdParamSchema }),
  vaccinationController.getById,
);

// POST /api/vaccination
router.post(
  '/',
  validate({ body: createVaccinationRecordSchema }),
  vaccinationController.create,
);

// PUT /api/vaccination/:id
router.put(
  '/:id',
  validate({ params: vaccinationIdParamSchema, body: updateVaccinationRecordSchema }),
  vaccinationController.update,
);

// DELETE /api/vaccination/:id
router.delete(
  '/:id',
  validate({ params: vaccinationIdParamSchema }),
  vaccinationController.remove,
);

export default router;

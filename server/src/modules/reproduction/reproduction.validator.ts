import { z } from 'zod';
import {
  ReproductionEventType,
  MatingType,
  PregnancyStatus,
  DeliveryType,
} from '../../types/enums';

export const createReproductionRecordSchema = z.object({
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  event_type: z.nativeEnum(ReproductionEventType, { error: () => ({ message: 'Jenis event tidak valid' }) }),
  event_date: z.coerce.date(),
  estrus_signs: z.array(z.string()).optional(),
  mating_type: z.nativeEnum(MatingType).optional(),
  sire_id: z.string().optional(),
  straw_code: z.string().trim().optional(),
  bull_id_straw: z.string().trim().optional(),
  pregnancy_status: z.nativeEnum(PregnancyStatus).optional(),
  gestation_days_expected: z.number().int().min(1).optional(),
  offspring_count: z.number().int().min(0).optional(),
  birth_type: z.nativeEnum(DeliveryType).optional(),
  kidding_ease_score: z.number().int().min(1).max(4).optional(),
  offspring_ids: z.array(z.string()).optional(),
  days_open: z.number().int().min(0).optional(),
  service_count: z.number().int().min(0).optional(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.event_type === ReproductionEventType.MATING) {
      return data.mating_type !== undefined;
    }
    return true;
  },
  { message: 'Jenis kawin wajib diisi untuk event mating', path: ['mating_type'] },
).refine(
  (data) => {
    if (
      data.event_type === ReproductionEventType.MATING &&
      data.mating_type === MatingType.NATURAL
    ) {
      return data.sire_id !== undefined && data.sire_id.length > 0;
    }
    return true;
  },
  { message: 'Pejantan wajib diisi untuk kawin alam', path: ['sire_id'] },
).refine(
  (data) => {
    if (
      data.event_type === ReproductionEventType.MATING &&
      data.mating_type === MatingType.AI
    ) {
      return data.straw_code !== undefined && data.straw_code.length > 0;
    }
    return true;
  },
  { message: 'Kode straw wajib diisi untuk inseminasi buatan', path: ['straw_code'] },
);

export const updateReproductionRecordSchema = z.object({
  event_type: z.nativeEnum(ReproductionEventType).optional(),
  event_date: z.coerce.date().optional(),
  estrus_signs: z.array(z.string()).optional(),
  mating_type: z.nativeEnum(MatingType).optional(),
  sire_id: z.string().optional(),
  straw_code: z.string().trim().optional(),
  bull_id_straw: z.string().trim().optional(),
  pregnancy_status: z.nativeEnum(PregnancyStatus).optional(),
  gestation_days_expected: z.number().int().min(1).optional(),
  offspring_count: z.number().int().min(0).optional(),
  birth_type: z.nativeEnum(DeliveryType).optional(),
  kidding_ease_score: z.number().int().min(1).max(4).optional(),
  offspring_ids: z.array(z.string()).optional(),
  days_open: z.number().int().min(0).optional(),
  service_count: z.number().int().min(0).optional(),
  notes: z.string().trim().optional(),
});

export const reproductionIdParamSchema = z.object({
  id: z.string().min(1, 'ID reproduksi wajib diisi'),
});

export type CreateReproductionRecordInput = z.infer<typeof createReproductionRecordSchema>;
export type UpdateReproductionRecordInput = z.infer<typeof updateReproductionRecordSchema>;

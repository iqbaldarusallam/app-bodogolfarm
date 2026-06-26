import { z } from 'zod';
import { QuarantineStatus, ClearanceTestResult } from '../../types/enums';

export const createQuarantineRecordSchema = z.object({
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  health_record_id: z.string().min(1, 'Catatan kesehatan asal wajib diisi'),
  quarantine_pen_id: z.string().min(1, 'Kandang karantina wajib diisi'),
  start_date: z.coerce.date(),
  expected_duration_days: z.number().int().min(1, 'Durasi karantina minimal 1 hari'),
  reason: z.string().min(1, 'Alasan karantina wajib diisi').trim(),
  disease_suspected: z.string().min(1, 'Penyakit yang dicurigai wajib diisi').trim(),
  clearance_test_result: z.nativeEnum(ClearanceTestResult).optional().default(ClearanceTestResult.PENDING),
  notes: z.string().trim().optional(),
});

export const updateQuarantineRecordSchema = z.object({
  expected_duration_days: z.number().int().min(1).optional(),
  end_date: z.coerce.date().optional(),
  reason: z.string().min(1).trim().optional(),
  disease_suspected: z.string().min(1).trim().optional(),
  clearance_test_done: z.boolean().optional(),
  clearance_test_result: z.nativeEnum(ClearanceTestResult).optional(),
  clearance_date: z.coerce.date().optional(),
  status: z.nativeEnum(QuarantineStatus).optional(),
  notes: z.string().trim().optional(),
});

export const clearanceSchema = z.object({
  clearance_test_result: z.nativeEnum(ClearanceTestResult, {
    error: () => ({ message: 'Hasil uji clearance tidak valid' }),
  }),
  clearance_date: z.coerce.date(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => data.clearance_test_result !== ClearanceTestResult.PENDING,
  { message: 'Hasil uji tidak boleh pending untuk clearance', path: ['clearance_test_result'] },
);

export const quarantineIdParamSchema = z.object({
  id: z.string().min(1, 'ID karantina wajib diisi'),
});

export type CreateQuarantineRecordInput = z.infer<typeof createQuarantineRecordSchema>;
export type UpdateQuarantineRecordInput = z.infer<typeof updateQuarantineRecordSchema>;
export type ClearanceInput = z.infer<typeof clearanceSchema>;

import { z } from 'zod';

export const createGrowthRecordSchema = z.object({
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  record_date: z.coerce.date(),
  weight_kg: z.number().positive('Berat badan harus lebih dari 0'),
  bcs: z.number().int().min(1, 'BCS minimal 1').max(5, 'BCS maksimal 5'),
  height_cm: z.number().positive().optional(),
  chest_girth_cm: z.number().positive().optional(),
  notes: z.string().trim().optional(),
});

export const updateGrowthRecordSchema = z.object({
  record_date: z.coerce.date().optional(),
  weight_kg: z.number().positive().optional(),
  bcs: z.number().int().min(1).max(5).optional(),
  height_cm: z.number().positive().optional(),
  chest_girth_cm: z.number().positive().optional(),
  notes: z.string().trim().optional(),
});

export const growthIdParamSchema = z.object({
  id: z.string().min(1, 'ID record wajib diisi'),
});

export const growthLivestockParamSchema = z.object({
  livestockId: z.string().min(1, 'ID ternak wajib diisi'),
});

export type CreateGrowthRecordInput = z.infer<typeof createGrowthRecordSchema>;
export type UpdateGrowthRecordInput = z.infer<typeof updateGrowthRecordSchema>;

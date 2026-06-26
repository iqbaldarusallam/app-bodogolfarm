import { z } from 'zod';
import { PenType } from '../../types/enums';

export const createPenSchema = z.object({
  farm_id: z.string().min(1, 'Farm wajib diisi'),
  pen_code: z.string().min(1, 'Kode kandang wajib diisi').trim(),
  pen_type: z.nativeEnum(PenType, { error: () => ({ message: 'Tipe kandang tidak valid' }) }),
  capacity: z.number().int().min(1, 'Kapasitas minimal 1'),
  current_count: z.number().int().min(0).optional().default(0),
  description: z.string().trim().optional(),
  is_active: z.boolean().optional().default(true),
});

export const updatePenSchema = z.object({
  pen_code: z.string().min(1).trim().optional(),
  pen_type: z.nativeEnum(PenType).optional(),
  capacity: z.number().int().min(1).optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export const penIdParamSchema = z.object({
  id: z.string().min(1, 'ID kandang wajib diisi'),
});

export type CreatePenInput = z.infer<typeof createPenSchema>;
export type UpdatePenInput = z.infer<typeof updatePenSchema>;

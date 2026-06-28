import { z } from 'zod';
import {
  LivestockSex,
  LivestockStatus,
  LivestockOrigin,
  BirthType,
  Species,
} from '../../types/enums';

export const createLivestockSchema = z.object({
  // farm_id TIDAK diterima dari client — di-inject server dari user yang login.
  ear_tag: z.string().min(1, 'Ear tag wajib diisi').trim(),
  national_id: z.string().trim().optional(),
  rfid_tag: z.string().trim().optional(),
  name: z.string().trim().optional(),
  species: z.nativeEnum(Species, { error: () => ({ message: 'Spesies tidak valid' }) }),
  breed: z.string().min(1, 'Ras/galur wajib diisi').trim(),
  sex: z.nativeEnum(LivestockSex, { error: () => ({ message: 'Jenis kelamin tidak valid' }) }),
  birth_date: z.coerce.date().refine((d) => d <= new Date(), {
    message: 'Tanggal lahir tidak boleh di masa depan',
  }),
  birth_type: z.nativeEnum(BirthType).optional(),
  origin: z.nativeEnum(LivestockOrigin, { error: () => ({ message: 'Asal ternak tidak valid' }) }),
  purchase_date: z.coerce.date().optional(),
  purchase_price: z.number().min(0).optional(),
  current_pen_id: z.string().min(1, 'Kandang aktif wajib diisi'),
  current_status: z.nativeEnum(LivestockStatus).optional().default(LivestockStatus.ACTIVE),
  dam_id: z.string().optional(),
  sire_id: z.string().optional(),
  photo_url: z.string().url().optional(),
  notes: z.string().trim().optional(),
});

export const updateLivestockSchema = z.object({
  ear_tag: z.string().min(1).trim().optional(),
  national_id: z.string().trim().optional(),
  rfid_tag: z.string().trim().optional(),
  name: z.string().trim().optional(),
  species: z.nativeEnum(Species).optional(),
  breed: z.string().min(1).trim().optional(),
  sex: z.nativeEnum(LivestockSex).optional(),
  birth_date: z.coerce.date().optional(),
  birth_type: z.nativeEnum(BirthType).optional(),
  origin: z.nativeEnum(LivestockOrigin).optional(),
  purchase_date: z.coerce.date().optional(),
  purchase_price: z.number().min(0).optional(),
  current_pen_id: z.string().min(1).optional(),
  current_status: z.nativeEnum(LivestockStatus).optional(),
  dam_id: z.string().optional(),
  sire_id: z.string().optional(),
  // nullable: kirim null untuk menghapus foto
  photo_url: z.string().url().nullable().optional(),
  notes: z.string().trim().optional(),
});

export const livestockIdParamSchema = z.object({
  id: z.string().min(1, 'ID ternak wajib diisi'),
});

export const livestockQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.nativeEnum(LivestockStatus).optional(),
  species: z.nativeEnum(Species).optional(),
  pen_id: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['ear_tag', 'name', 'birth_date', 'created_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateLivestockInput = z.infer<typeof createLivestockSchema>;
export type UpdateLivestockInput = z.infer<typeof updateLivestockSchema>;
export type LivestockQueryInput = z.infer<typeof livestockQuerySchema>;

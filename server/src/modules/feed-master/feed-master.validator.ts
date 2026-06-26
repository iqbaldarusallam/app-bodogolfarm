import { z } from 'zod';
import { FeedType, FeedSource, FeedUnit } from '../../types/enums';

export const createFeedMasterSchema = z.object({
  farm_id: z.string().min(1, 'Farm wajib diisi'),
  feed_name: z.string().min(1, 'Nama pakan wajib diisi').trim(),
  feed_type: z.nativeEnum(FeedType, { error: () => ({ message: 'Jenis pakan tidak valid' }) }),
  source: z.nativeEnum(FeedSource, { error: () => ({ message: 'Sumber pakan tidak valid' }) }),
  dry_matter_pct: z.number().min(0).max(100, 'BK maksimal 100%'),
  crude_protein_pct: z.number().min(0).max(100).optional(),
  metabolizable_energy: z.number().min(0).optional(),
  unit: z.nativeEnum(FeedUnit, { error: () => ({ message: 'Satuan tidak valid' }) }),
  price_per_unit: z.number().min(0).optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateFeedMasterSchema = z.object({
  feed_name: z.string().min(1).trim().optional(),
  feed_type: z.nativeEnum(FeedType).optional(),
  source: z.nativeEnum(FeedSource).optional(),
  dry_matter_pct: z.number().min(0).max(100).optional(),
  crude_protein_pct: z.number().min(0).max(100).optional(),
  metabolizable_energy: z.number().min(0).optional(),
  unit: z.nativeEnum(FeedUnit).optional(),
  price_per_unit: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const feedMasterIdParamSchema = z.object({
  id: z.string().min(1, 'ID pakan wajib diisi'),
});

export type CreateFeedMasterInput = z.infer<typeof createFeedMasterSchema>;
export type UpdateFeedMasterInput = z.infer<typeof updateFeedMasterSchema>;

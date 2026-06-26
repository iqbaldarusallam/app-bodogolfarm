import { z } from 'zod';
import { FeedingTime, AppetiteResponse } from '../../types/enums';

export const createFeedingLogSchema = z.object({
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  feed_master_id: z.string().min(1, 'Master pakan wajib diisi'),
  feed_date: z.coerce.date(),
  feeding_time: z.nativeEnum(FeedingTime, { error: () => ({ message: 'Waktu pakan tidak valid' }) }),
  amount_given_kg: z.number().positive('Jumlah pemberian harus lebih dari 0'),
  amount_consumed_kg: z.number().min(0).optional(),
  appetite_response: z.nativeEnum(AppetiteResponse, { error: () => ({ message: 'Respon nafsu makan tidak valid' }) }),
  notes: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.amount_consumed_kg !== undefined) {
      return data.amount_consumed_kg <= data.amount_given_kg;
    }
    return true;
  },
  { message: 'Jumlah konsumsi tidak boleh melebihi jumlah pemberian', path: ['amount_consumed_kg'] },
);

export const updateFeedingLogSchema = z.object({
  feed_date: z.coerce.date().optional(),
  feeding_time: z.nativeEnum(FeedingTime).optional(),
  amount_given_kg: z.number().positive().optional(),
  amount_consumed_kg: z.number().min(0).optional(),
  appetite_response: z.nativeEnum(AppetiteResponse).optional(),
  notes: z.string().trim().optional(),
});

export const feedingIdParamSchema = z.object({
  id: z.string().min(1, 'ID log pakan wajib diisi'),
});

export const feedingLivestockParamSchema = z.object({
  livestockId: z.string().min(1, 'ID ternak wajib diisi'),
});

export type CreateFeedingLogInput = z.infer<typeof createFeedingLogSchema>;
export type UpdateFeedingLogInput = z.infer<typeof updateFeedingLogSchema>;

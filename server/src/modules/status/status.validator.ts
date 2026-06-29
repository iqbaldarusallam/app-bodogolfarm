import { z } from 'zod';
import { LivestockStatus } from '../../types/enums';

export const createStatusHistorySchema = z.object({
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  // status_from dihapus — ditentukan server dari status saat ini
  status_to: z.nativeEnum(LivestockStatus, { error: () => ({ message: 'Status tujuan tidak valid' }) }),
  changed_date: z.coerce.date().optional(),
  reason: z.string().min(1, 'Alasan perubahan status wajib diisi').trim(),
  sale_price: z.number().min(0).optional(),
  sale_buyer: z.string().trim().optional(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.status_to === LivestockStatus.SOLD) {
      return data.sale_price !== undefined && data.sale_price >= 0;
    }
    return true;
  },
  { message: 'Harga jual wajib diisi untuk status sold', path: ['sale_price'] },
);

export const statusIdParamSchema = z.object({
  id: z.string().min(1, 'ID status wajib diisi'),
});

export const statusLivestockParamSchema = z.object({
  livestockId: z.string().min(1, 'ID ternak wajib diisi'),
});

export type CreateStatusHistoryInput = z.infer<typeof createStatusHistorySchema>;

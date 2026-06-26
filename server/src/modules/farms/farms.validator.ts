import { z } from 'zod';

export const createFarmSchema = z.object({
  name: z.string().min(1, 'Nama farm wajib diisi').trim(),
  address: z.string().min(1, 'Alamat farm wajib diisi').trim(),
  owner: z.string().min(1, 'Pemilik farm wajib diisi').trim(),
});

export const updateFarmSchema = z.object({
  name: z.string().min(1).trim().optional(),
  address: z.string().min(1).trim().optional(),
  owner: z.string().min(1).trim().optional(),
});

export const farmIdParamSchema = z.object({
  id: z.string().min(1, 'ID farm wajib diisi'),
});

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;

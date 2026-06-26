import { z } from 'zod';
import { VaccinationRoute } from '../../types/enums';

export const createVaccinationRecordSchema = z.object({
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  vaccine_name: z.string().min(1, 'Nama vaksin wajib diisi').trim(),
  disease_target: z.string().min(1, 'Penyakit target wajib diisi').trim(),
  dosage: z.number().positive('Dosis harus lebih dari 0'),
  dosage_unit: z.string().min(1, 'Satuan dosis wajib diisi').trim(),
  route: z.nativeEnum(VaccinationRoute, { error: () => ({ message: 'Rute pemberian tidak valid' }) }),
  vaccination_date: z.coerce.date(),
  booster_due_date: z.coerce.date().optional(),
  batch_number: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.booster_due_date) {
      return data.booster_due_date >= data.vaccination_date;
    }
    return true;
  },
  { message: 'Tanggal booster harus setelah tanggal vaksinasi', path: ['booster_due_date'] },
);

export const updateVaccinationRecordSchema = z.object({
  vaccine_name: z.string().min(1).trim().optional(),
  disease_target: z.string().min(1).trim().optional(),
  dosage: z.number().positive().optional(),
  dosage_unit: z.string().min(1).trim().optional(),
  route: z.nativeEnum(VaccinationRoute).optional(),
  vaccination_date: z.coerce.date().optional(),
  booster_due_date: z.coerce.date().optional(),
  batch_number: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const vaccinationIdParamSchema = z.object({
  id: z.string().min(1, 'ID vaksinasi wajib diisi'),
});

export type CreateVaccinationRecordInput = z.infer<typeof createVaccinationRecordSchema>;
export type UpdateVaccinationRecordInput = z.infer<typeof updateVaccinationRecordSchema>;

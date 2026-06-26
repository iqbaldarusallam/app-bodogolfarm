import { z } from 'zod';
import {
  MedicationType,
  DosageUnit,
  MedicationRoute,
  MedicationResponse,
} from '../../types/enums';

export const createMedicationLogSchema = z.object({
  health_record_id: z.string().min(1, 'Catatan kesehatan wajib diisi'),
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  medication_type: z.nativeEnum(MedicationType, { error: () => ({ message: 'Jenis pengobatan tidak valid' }) }),
  medicine_name: z.string().min(1, 'Nama obat wajib diisi').trim(),
  active_ingredient: z.string().trim().optional(),
  dosage: z.number().positive('Dosis harus lebih dari 0'),
  dosage_unit: z.nativeEnum(DosageUnit, { error: () => ({ message: 'Satuan dosis tidak valid' }) }),
  route: z.nativeEnum(MedicationRoute, { error: () => ({ message: 'Rute pemberian tidak valid' }) }),
  frequency: z.string().min(1, 'Frekuensi wajib diisi').trim(),
  duration_days: z.number().int().min(1, 'Durasi minimal 1 hari'),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  withdrawal_period_days: z.number().min(0).optional(),
  response: z.nativeEnum(MedicationResponse).optional(),
  batch_number: z.string().trim().optional(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => data.end_date >= data.start_date,
  { message: 'Tanggal selesai harus setelah tanggal mulai', path: ['end_date'] },
).refine(
  (data) => {
    if (data.medication_type === MedicationType.TREATMENT) {
      return data.withdrawal_period_days !== undefined && data.withdrawal_period_days >= 0;
    }
    return true;
  },
  { message: 'Masa tunggu wajib diisi untuk jenis treatment', path: ['withdrawal_period_days'] },
);

export const updateMedicationLogSchema = z.object({
  medication_type: z.nativeEnum(MedicationType).optional(),
  medicine_name: z.string().min(1).trim().optional(),
  active_ingredient: z.string().trim().optional(),
  dosage: z.number().positive().optional(),
  dosage_unit: z.nativeEnum(DosageUnit).optional(),
  route: z.nativeEnum(MedicationRoute).optional(),
  frequency: z.string().min(1).trim().optional(),
  duration_days: z.number().int().min(1).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  withdrawal_period_days: z.number().min(0).optional(),
  response: z.nativeEnum(MedicationResponse).optional(),
  batch_number: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const medicationIdParamSchema = z.object({
  id: z.string().min(1, 'ID log obat wajib diisi'),
});

export type CreateMedicationLogInput = z.infer<typeof createMedicationLogSchema>;
export type UpdateMedicationLogInput = z.infer<typeof updateMedicationLogSchema>;

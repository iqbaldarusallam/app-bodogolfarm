import { z } from 'zod';
import { RumenMotility, DiseaseCategory } from '../../types/enums';

export const createHealthRecordSchema = z.object({
  livestock_id: z.string().min(1, 'Ternak wajib diisi'),
  record_date: z.coerce.date(),
  chief_complaint: z.string().min(1, 'Keluhan utama wajib diisi').trim(),
  symptoms: z.array(z.string()).min(1, 'Minimal satu gejala harus dipilih'),
  body_temp_celsius: z.number().min(35, 'Suhu minimal 35°C').max(45, 'Suhu maksimal 45°C').optional(),
  heart_rate_bpm: z.number().positive('Detak jantung harus positif').optional(),
  respiratory_rate: z.number().positive('Frekuensi napas harus positif').optional(),
  rumen_motility: z.nativeEnum(RumenMotility).optional(),
  examination_findings: z.string().trim().optional(),
  diagnosis: z.string().trim().optional(),
  diagnosis_code: z.string().trim().optional(),
  is_infectious: z.boolean().optional().default(false),
  disease_category: z.nativeEnum(DiseaseCategory, { error: () => ({ message: 'Kategori penyakit tidak valid' }) }),
  action_taken: z.string().trim().optional(),
  referral_needed: z.boolean().optional().default(false),
  follow_up_date: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.follow_up_date) {
      return data.follow_up_date >= data.record_date;
    }
    return true;
  },
  { message: 'Tanggal kontrol harus setelah tanggal pemeriksaan', path: ['follow_up_date'] },
);

export const updateHealthRecordSchema = z.object({
  record_date: z.coerce.date().optional(),
  chief_complaint: z.string().min(1).trim().optional(),
  symptoms: z.array(z.string()).min(1).optional(),
  body_temp_celsius: z.number().min(35).max(45).optional(),
  heart_rate_bpm: z.number().positive().optional(),
  respiratory_rate: z.number().positive().optional(),
  rumen_motility: z.nativeEnum(RumenMotility).optional(),
  examination_findings: z.string().trim().optional(),
  diagnosis: z.string().trim().optional(),
  diagnosis_code: z.string().trim().optional(),
  is_infectious: z.boolean().optional(),
  disease_category: z.nativeEnum(DiseaseCategory).optional(),
  action_taken: z.string().trim().optional(),
  referral_needed: z.boolean().optional(),
  follow_up_date: z.coerce.date().optional(),
});

export const healthIdParamSchema = z.object({
  id: z.string().min(1, 'ID catatan kesehatan wajib diisi'),
});

export const healthLivestockParamSchema = z.object({
  livestockId: z.string().min(1, 'ID ternak wajib diisi'),
});

export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>;
export type UpdateHealthRecordInput = z.infer<typeof updateHealthRecordSchema>;

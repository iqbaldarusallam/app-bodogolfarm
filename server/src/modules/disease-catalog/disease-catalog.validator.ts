import { z } from 'zod';

export const createDiseaseCatalogSchema = z.object({
  code: z.string().min(1, 'Kode penyakit wajib diisi').trim().toUpperCase(),
  name: z.string().min(1, 'Nama penyakit wajib diisi').trim(),
  category: z.string().min(1, 'Kategori penyakit wajib diisi').trim(),
  common_symptoms: z.array(z.string().trim()).optional().default([]),
  severity_default: z.enum(['mild', 'moderate', 'severe']).optional().default('moderate'),
  is_contagious: z.boolean().optional().default(false),
  quarantine_recommended: z.boolean().optional().default(false),
  description: z.string().trim().optional().default(''),
  is_active: z.boolean().optional().default(true),
});

export const updateDiseaseCatalogSchema = z.object({
  code: z.string().min(1).trim().toUpperCase().optional(),
  name: z.string().min(1).trim().optional(),
  category: z.string().min(1).trim().optional(),
  common_symptoms: z.array(z.string().trim()).optional(),
  severity_default: z.enum(['mild', 'moderate', 'severe']).optional(),
  is_contagious: z.boolean().optional(),
  quarantine_recommended: z.boolean().optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export const diseaseCatalogIdParamSchema = z.object({
  id: z.string().min(1, 'ID penyakit wajib diisi'),
});

export type CreateDiseaseCatalogInput = z.infer<typeof createDiseaseCatalogSchema>;
export type UpdateDiseaseCatalogInput = z.infer<typeof updateDiseaseCatalogSchema>;

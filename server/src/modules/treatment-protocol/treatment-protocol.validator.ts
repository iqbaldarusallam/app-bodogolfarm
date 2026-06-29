import { z } from 'zod';

export const createTreatmentProtocolSchema = z.object({
  disease_catalog_id: z.string().min(1, 'Penyakit wajib diisi'),
  protocol_name: z.string().min(1, 'Nama protokol wajib diisi').trim(),
  severity_level: z.enum(['mild', 'moderate', 'severe']).optional().default('moderate'),
  initial_action: z.string().min(1, 'Tindakan awal wajib diisi').trim(),
  recommended_medicines: z.array(z.string().trim()).optional().default([]),
  recommended_dosage_notes: z.string().trim().optional().default(''),
  recommended_duration_days: z.number().int().min(1).optional().default(7),
  quarantine_required: z.boolean().optional().default(false),
  cage_sanitation_action: z.string().trim().optional().default(''),
  vet_escalation_criteria: z.string().trim().optional().default(''),
  follow_up_after_days: z.number().int().min(0).optional().default(3),
  is_active: z.boolean().optional().default(true),
});

export const updateTreatmentProtocolSchema = z.object({
  protocol_name: z.string().min(1).trim().optional(),
  severity_level: z.enum(['mild', 'moderate', 'severe']).optional(),
  initial_action: z.string().min(1).trim().optional(),
  recommended_medicines: z.array(z.string().trim()).optional(),
  recommended_dosage_notes: z.string().trim().optional(),
  recommended_duration_days: z.number().int().min(1).optional(),
  quarantine_required: z.boolean().optional(),
  cage_sanitation_action: z.string().trim().optional(),
  vet_escalation_criteria: z.string().trim().optional(),
  follow_up_after_days: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const treatmentProtocolIdParamSchema = z.object({
  id: z.string().min(1, 'ID protokol wajib diisi'),
});

export type CreateTreatmentProtocolInput = z.infer<typeof createTreatmentProtocolSchema>;
export type UpdateTreatmentProtocolInput = z.infer<typeof updateTreatmentProtocolSchema>;

// ─────────────────────────────────────────────────────────
// Vaccination types
// ─────────────────────────────────────────────────────────

export type VaccinationRoute = 'SC' | 'IM' | 'intranasal';

export interface VaccinationRecord {
  _id: string;
  livestock_id: string;
  vaccine_name: string;
  disease_target: string;
  dosage: number;
  dosage_unit: string;
  route: VaccinationRoute;
  vaccination_date: string;
  booster_due_date: string;
  batch_number?: string;
  manufacturer?: string;
  administered_by: string;
  notes?: string;
  created_at: string;
}

export interface CreateVaccinationInput {
  livestock_id: string;
  vaccine_name: string;
  disease_target: string;
  dosage: number;
  dosage_unit: string;
  route: VaccinationRoute;
  vaccination_date: string;
  booster_due_date?: string;
  batch_number?: string;
  manufacturer?: string;
  notes?: string;
}

// ─────────────────────────────────────────────────────────
// Medication types
// ─────────────────────────────────────────────────────────

export type MedicationType = 'treatment' | 'vaccine' | 'vitamin' | 'antiparasitic';
export type DosageUnit = 'ml' | 'mg' | 'tablet' | 'sachet';
export type MedicationRoute = 'oral' | 'injeksi_SC' | 'injeksi_IM' | 'injeksi_IV' | 'topikal';

export interface MedicationLog {
  _id: string;
  health_record_id: string;
  livestock_id: string;
  medication_type: MedicationType;
  medicine_name: string;
  active_ingredient?: string;
  dosage: number;
  dosage_unit: DosageUnit;
  route: MedicationRoute;
  frequency: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  withdrawal_period_days?: number;
  withdrawal_end_date?: string;
  response?: string;
  batch_number?: string;
  notes?: string;
  administered_by: string;
  created_at: string;
}

export interface CreateMedicationLogInput {
  health_record_id?: string;
  livestock_id: string;
  medication_type: MedicationType;
  medicine_name: string;
  active_ingredient?: string;
  dosage: number;
  dosage_unit: DosageUnit;
  route: MedicationRoute;
  frequency: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  withdrawal_period_days?: number;
  response?: string;
  batch_number?: string;
  notes?: string;
}

// ─────────────────────────────────────────────────────────
// Health Record types
// ─────────────────────────────────────────────────────────

export type DiseaseCategory =
  | 'metabolic'
  | 'infectious'
  | 'parasitic'
  | 'nutritional'
  | 'injury'
  | 'reproductive'
  | 'other';

export type RumenMotility = 'normal' | 'reduced' | 'absent';

export interface HealthRecord {
  _id: string;
  livestock_id: string;
  record_date: string;
  chief_complaint: string;
  symptoms: string[];
  body_temp_celsius?: number;
  heart_rate_bpm?: number;
  respiratory_rate?: number;
  rumen_motility?: RumenMotility;
  examination_findings?: string;
  diagnosis?: string;
  diagnosis_code?: string;
  is_infectious: boolean;
  disease_category: DiseaseCategory;
  action_taken?: string;
  referral_needed: boolean;
  follow_up_date?: string;
  examiner: string;
  created_at: string;
}

export interface CreateHealthRecordInput {
  livestock_id: string;
  record_date: string;
  chief_complaint: string;
  symptoms: string[];
  body_temp_celsius?: number;
  heart_rate_bpm?: number;
  respiratory_rate?: number;
  rumen_motility?: RumenMotility;
  examination_findings?: string;
  diagnosis?: string;
  diagnosis_code?: string;
  is_infectious?: boolean;
  disease_category: DiseaseCategory;
  action_taken?: string;
  referral_needed?: boolean;
  follow_up_date?: string;
}

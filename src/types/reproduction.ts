export type ReproductionEventType = 'estrus' | 'mating' | 'pregnancy_check' | 'birth' | 'weaning';

export type MatingType = 'natural' | 'AI';

export type BirthType = 'normal' | 'assisted' | 'caesarean';

export interface ReproductionRecord {
  _id: string;
  livestock_id: string;
  event_type: ReproductionEventType;
  event_date: string;
  estrus_signs?: string[];
  mating_type?: MatingType;
  sire_id?: string;
  straw_code?: string;
  bull_id_straw?: string;
  pregnancy_status?: 'positive' | 'negative' | 'not_checked';
  gestation_days_expected?: number;
  expected_birth_date?: string;
  offspring_count?: number;
  birth_type?: BirthType;
  kidding_ease_score?: number;
  offspring_ids?: string[];
  days_open?: number;
  service_count?: number;
  notes?: string;
  recorded_by?: string;
  created_at: string;
}

export interface CreateReproductionInput {
  livestock_id: string;
  event_type: ReproductionEventType;
  event_date: string;
  estrus_signs?: string[];
  mating_type?: MatingType;
  sire_id?: string;
  straw_code?: string;
  bull_id_straw?: string;
  pregnancy_status?: 'positive' | 'negative' | 'not_checked';
  offspring_count?: number;
  birth_type?: BirthType;
  kidding_ease_score?: number;
  notes?: string;
}

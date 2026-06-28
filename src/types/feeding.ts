// ─────────────────────────────────────────────────────────
// Feeding & FeedMaster types
// ─────────────────────────────────────────────────────────

export type FeedingTime = 'morning' | 'afternoon' | 'evening';
export type AppetiteResponse = 'normal' | 'reduced' | 'refused';
export type FeedType = 'hijauan' | 'konsentrat' | 'silase' | 'limbah' | 'suplemen';
export type FeedSource = 'lapangan' | 'beli' | 'fermentasi_sendiri';
export type FeedUnit = 'kg' | 'liter' | 'ikat';

export interface CreateFeedMasterInput {
  farm_id: string;
  feed_name: string;
  feed_type: string;
  source: string;
  dry_matter_pct: number;
  crude_protein_pct?: number;
  metabolizable_energy?: number;
  unit: string;
  price_per_unit?: number;
}

export interface FeedMaster {
  _id: string;
  farm_id: string;
  feed_name: string;
  feed_type: FeedType;
  source: FeedSource;
  dry_matter_pct: number;
  crude_protein_pct?: number;
  metabolizable_energy?: number;
  unit: FeedUnit;
  price_per_unit?: number;
  is_active: boolean;
}

export interface FeedingLog {
  _id: string;
  livestock_id: string;
  feed_master_id: string;
  feed_date: string;
  feeding_time: FeedingTime;
  amount_given_kg: number;
  amount_consumed_kg?: number;
  appetite_response: AppetiteResponse;
  notes?: string;
  recorded_by: string;
  dmi_calculated?: number;
  cost_calculated?: number;
  created_at: string;
}

export interface CreateFeedingLogInput {
  livestock_id: string;
  feed_master_id: string;
  feed_date: string;
  feeding_time: FeedingTime;
  amount_given_kg: number;
  amount_consumed_kg?: number;
  appetite_response: AppetiteResponse;
  notes?: string;
}

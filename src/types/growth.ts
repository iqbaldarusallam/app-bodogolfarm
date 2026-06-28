// ─────────────────────────────────────────────────────────
// Growth Record types — sinkron dengan backend growth-record.model.ts
// ─────────────────────────────────────────────────────────

export interface GrowthRecord {
  _id: string;
  livestock_id: string;
  record_date: string;
  weight_kg: number;
  bcs: number;
  measured_by: string;
  height_cm?: number;
  chest_girth_cm?: number;
  adg_calculated?: number;
  notes?: string;
  created_at: string;
}

export interface CreateGrowthRecordInput {
  livestock_id: string;
  record_date: string;
  weight_kg: number;
  bcs: number;
  height_cm?: number;
  chest_girth_cm?: number;
  notes?: string;
}

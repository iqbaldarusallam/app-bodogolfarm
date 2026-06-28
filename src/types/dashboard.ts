// ─────────────────────────────────────────────────────────
// Dashboard types — sinkron dengan backend dashboard.service.ts
// ─────────────────────────────────────────────────────────

export interface LivestockStats {
  total: number;
  active: number;
  sick: number;
  quarantine: number;
  sold: number;
  dead: number;
  transferred: number;
}

export interface PopulatedLivestock {
  _id: string;
  ear_tag: string;
  name: string;
}

export interface GrowthRecordItem {
  _id: string;
  livestock_id: PopulatedLivestock;
  record_date: string;
  weight_kg: number;
  adg_calculated?: number;
}

export interface HealthRecordItem {
  _id: string;
  livestock_id: PopulatedLivestock;
  record_date: string;
  chief_complaint: string;
  diagnosis?: string;
  body_temp_celsius?: number;
  examiner?: { name: string };
}

export interface BoosterItem {
  _id: string;
  livestock_id: PopulatedLivestock;
  booster_due_date: string;
  vaccine_name?: string;
}

export interface WithdrawalItem {
  _id: string;
  livestock_id: PopulatedLivestock;
  withdrawal_end_date: string;
  medicine_name?: string;
}

export interface PregnantItem {
  _id: string;
  livestock_id: PopulatedLivestock;
  event_date: string;
}

export interface DashboardAlerts {
  upcoming_boosters: BoosterItem[];
  active_withdrawals: WithdrawalItem[];
  pregnant_livestock: PregnantItem[];
}

export interface DashboardRecent {
  growth: GrowthRecordItem[];
  health: HealthRecordItem[];
}

export interface DashboardSummary {
  livestock: LivestockStats;
  quarantine: { active: number };
  alerts: DashboardAlerts;
  recent: DashboardRecent;
}

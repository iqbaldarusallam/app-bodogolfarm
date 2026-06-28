// ─────────────────────────────────────────────────────────
// Quarantine types
// ─────────────────────────────────────────────────────────

export type ClearanceTestResult = 'pending' | 'negative' | 'positive';

export interface QuarantineRecord {
  _id: string;
  livestock_id: string;
  health_record_id: string;
  quarantine_pen_id: string;
  start_date: string;
  expected_duration_days: number;
  reason: string;
  disease_suspected: string;
  clearance_test_done: boolean;
  clearance_test_result: ClearanceTestResult;
  clearance_date?: string;
  cleared_by?: string;
  end_date?: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface CreateQuarantineInput {
  livestock_id: string;
  health_record_id: string;
  quarantine_pen_id: string;
  start_date: string;
  expected_duration_days: number;
  reason: string;
  disease_suspected: string;
  clearance_test_result?: ClearanceTestResult;
  notes?: string;
}

export interface CreatePenInput {
  farm_id: string;
  pen_code: string;
  pen_type: string;
  capacity: number;
  description?: string;
}

export interface Pen {
  _id: string;
  farm_id: string;
  pen_code: string;
  pen_type: string;
  capacity: number;
  current_count: number;
  description?: string;
  is_active: boolean;
}

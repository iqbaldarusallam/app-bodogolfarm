// ─────────────────────────────────────────────────────────
// Status History types
// ─────────────────────────────────────────────────────────

import type { LivestockStatus } from './livestock';

export interface CreateStatusInput {
  livestock_id: string;
  status_from: LivestockStatus;
  status_to: LivestockStatus;
  changed_date: string;
  reason: string;
  sale_price?: number;
  sale_buyer?: string;
  notes?: string;
}

export interface StatusHistory {
  _id: string;
  livestock_id: string;
  status_from: LivestockStatus;
  status_to: LivestockStatus;
  changed_date: string;
  reason: string;
  sale_price?: number;
  sale_buyer?: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

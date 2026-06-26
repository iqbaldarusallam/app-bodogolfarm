// ─────────────────────────────────────────────────────────
// Shared interfaces berdasarkan PRD Livestock Recording
// ─────────────────────────────────────────────────────────

import { Types } from 'mongoose';

// ── Common ──
export interface IBaseDocument {
  _id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

export interface IBaseDocumentNoTimestamps {
  _id: Types.ObjectId;
  created_at: Date;
}

// ── Query helpers ──
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IDateRangeQuery {
  start_date?: string;
  end_date?: string;
}

export interface IFarmScoped {
  farm_id: Types.ObjectId;
}

export interface ILivestockScoped {
  livestock_id: Types.ObjectId;
}

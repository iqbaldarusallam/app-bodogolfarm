// ─────────────────────────────────────────────────────────
// Livestock types — sinkron dengan backend livestock.model.ts
// ─────────────────────────────────────────────────────────

export type Species = 'sapi' | 'domba' | 'kambing' | 'kerbau';
export type LivestockSex = 'male' | 'female';
export type LivestockStatus = 'active' | 'sick' | 'quarantine' | 'sold' | 'dead' | 'transferred';
export type LivestockOrigin = 'own_birth' | 'purchase' | 'donation';
export type BirthType = 'single' | 'twin' | 'triplet';

export interface LivestockAge {
  days: number;
  months: number;
  years: number;
}

export interface Livestock {
  _id: string;
  farm_id: string;
  ear_tag: string;
  national_id?: string;
  rfid_tag?: string;
  name?: string;
  species: Species;
  breed: string;
  sex: LivestockSex;
  birth_date: string;
  birth_type?: BirthType;
  origin: LivestockOrigin;
  purchase_date?: string;
  purchase_price?: number;
  current_pen_id: string;
  current_status: LivestockStatus;
  dam_id?: string;
  sire_id?: string;
  photo_url?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  age: LivestockAge;
}

export interface LivestockListResponse {
  data: Livestock[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LivestockQuery {
  page?: number;
  limit?: number;
  status?: LivestockStatus;
  species?: Species;
  pen_id?: string;
  search?: string;
  sort?: 'ear_tag' | 'name' | 'birth_date' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface LivestockDetail extends Omit<Livestock, 'current_pen_id' | 'dam_id' | 'sire_id'> {
  current_pen_id: { _id: string; pen_code: string; pen_type: string } | string;
  dam_id: { _id: string; ear_tag: string; name: string } | string | null;
  sire_id: { _id: string; ear_tag: string; name: string } | string | null;
}

export interface LivestockStats {
  total: number;
  active: number;
  sick: number;
  quarantine: number;
  sold: number;
  dead: number;
}

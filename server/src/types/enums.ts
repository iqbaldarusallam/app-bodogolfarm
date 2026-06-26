// ─────────────────────────────────────────────────────────
// Enums berdasarkan PRD Livestock Recording Bodogol Farm
// ─────────────────────────────────────────────────────────

// ── Users ──
export enum UserRole {
  OFFICER = 'officer',
  SENIOR_OFFICER = 'senior_officer',
  MANAGER = 'manager',
}

// ── Livestock ──
export enum LivestockSex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum LivestockStatus {
  ACTIVE = 'active',
  SICK = 'sick',
  QUARANTINE = 'quarantine',
  SOLD = 'sold',
  DEAD = 'dead',
  TRANSFERRED = 'transferred',
}

export enum LivestockOrigin {
  OWN_BIRTH = 'own_birth',
  PURCHASE = 'purchase',
  DONATION = 'donation',
}

export enum BirthType {
  SINGLE = 'single',
  TWIN = 'twin',
  TRIPLET = 'triplet',
}

export enum Species {
  SAPI = 'sapi',
  DOMBA = 'domba',
  KAMBING = 'kambing',
  KERBAU = 'kerbau',
}

// ── Pens ──
export enum PenType {
  REGULAR = 'regular',
  QUARANTINE = 'quarantine',
  NURSERY = 'nursery',
  FATTENING = 'fattening',
}

// ── Feeding ──
export enum FeedingTime {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
}

export enum AppetiteResponse {
  NORMAL = 'normal',
  REDUCED = 'reduced',
  REFUSED = 'refused',
}

export enum FeedType {
  HIJAUAN = 'hijauan',
  KONSENTRAT = 'konsentrat',
  SILASE = 'silase',
  LIMBAH = 'limbah',
  SUPLEMEN = 'suplemen',
}

export enum FeedSource {
  LAPANGAN = 'lapangan',
  BELI = 'beli',
  FERMENTASI_SENDIRI = 'fermentasi_sendiri',
}

export enum FeedUnit {
  KG = 'kg',
  LITER = 'liter',
  IKAT = 'ikat',
}

// ── Health ──
export enum RumenMotility {
  NORMAL = 'normal',
  REDUCED = 'reduced',
  ABSENT = 'absent',
}

export enum DiseaseCategory {
  METABOLIC = 'metabolic',
  INFECTIOUS = 'infectious',
  PARASITIC = 'parasitic',
  NUTRITIONAL = 'nutritional',
  INJURY = 'injury',
  REPRODUCTIVE = 'reproductive',
  OTHER = 'other',
}

// ── Medication ──
export enum MedicationType {
  TREATMENT = 'treatment',
  VACCINE = 'vaccine',
  VITAMIN = 'vitamin',
  ANTIPARASITIC = 'antiparasitic',
}

export enum DosageUnit {
  ML = 'ml',
  MG = 'mg',
  TABLET = 'tablet',
  SACHET = 'sachet',
}

export enum MedicationRoute {
  ORAL = 'oral',
  SC = 'injeksi_SC',
  IM = 'injeksi_IM',
  IV = 'injeksi_IV',
  TOPICAL = 'topikal',
}

export enum MedicationResponse {
  IMPROVING = 'improving',
  NO_CHANGE = 'no_change',
  WORSENING = 'worsening',
}

// ── Vaccination ──
export enum VaccinationRoute {
  SC = 'SC',
  IM = 'IM',
  INTRANASAL = 'intranasal',
}

// ── Quarantine ──
export enum QuarantineStatus {
  ACTIVE = 'active',
  CLEARED = 'cleared',
  FAILED = 'failed',
}

export enum ClearanceTestResult {
  NEGATIVE = 'negative',
  POSITIVE = 'positive',
  PENDING = 'pending',
}

// ── Reproduction ──
export enum ReproductionEventType {
  ESTRUS = 'estrus',
  MATING = 'mating',
  PREGNANCY_CHECK = 'pregnancy_check',
  BIRTH = 'birth',
  ABORTION = 'abortion',
  WEANING = 'weaning',
}

export enum MatingType {
  NATURAL = 'natural',
  AI = 'AI',
}

export enum PregnancyStatus {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NOT_CHECKED = 'not_checked',
}

export enum DeliveryType {
  NORMAL = 'normal',
  ASSISTED = 'assisted',
  CAESAREAN = 'caesarean',
}

// ── Offline Sync ──
export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}

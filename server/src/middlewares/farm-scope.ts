// ─────────────────────────────────────────────────────────
// Farm-scoping helpers — prevent cross-farm data access
// ─────────────────────────────────────────────────────────

import { AppError } from './error-handler';

type LeanDoc = Record<string, any>;

/**
 * Verify that a document belongs to the given farm.
 * Works for models with a direct `farm_id` field (Livestock, Pen, User, FeedMaster).
 */
export function assertBelongsToFarm(doc: LeanDoc | null, farmId: string, entityLabel: string): LeanDoc {
  if (!doc) throw new AppError(`${entityLabel} tidak ditemukan`, 404);
  if (doc.farm_id?.toString() !== farmId) {
    throw new AppError(`${entityLabel} tidak ditemukan di farm ini`, 404);
  }
  return doc;
}

/**
 * Verify that a livestock-referencing document belongs to the given farm.
 * Works for models that have `livestock_id` (Growth, Feeding, Health, Medication,
 * Vaccination, Quarantine, Reproduction, StatusHistory).
 */
export function assertLivestockBelongsToFarm(
  doc: LeanDoc | null,
  farmId: string,
  entityLabel: string,
): LeanDoc {
  if (!doc) throw new AppError(`${entityLabel} tidak ditemukan`, 404);

  // After populate, livestock_id may be an object with farm_id
  const livestockRef = doc.livestock_id;
  const livestockFarmId = typeof livestockRef === 'object' && livestockRef !== null
    ? livestockRef.farm_id?.toString()
    : undefined;

  if (livestockFarmId && livestockFarmId !== farmId) {
    throw new AppError(`${entityLabel} tidak ditemukan di farm ini`, 404);
  }

  return doc;
}

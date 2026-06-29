import { StatusHistory, IStatusHistory } from '../../models/status-history.model';
import { Livestock } from '../../models/livestock.model';
import { MedicationLog } from '../../models/medication-log.model';
import { AppError, assertLivestockBelongsToFarm } from '../../middlewares';
import { CreateStatusHistoryInput } from './status.validator';
import { LivestockStatus } from '../../types/enums';
import { calculateDeathLoss } from '../death-loss/death-loss.service';

// ── Allowed status transitions ──
// Based on PRD: active→{sick,quarantine,sold,dead,transferred}
//               quarantine→{active,dead,transferred}
const ALLOWED_TRANSITIONS: Record<LivestockStatus, LivestockStatus[]> = {
  [LivestockStatus.ACTIVE]: [
    LivestockStatus.SICK,
    LivestockStatus.QUARANTINE,
    LivestockStatus.SOLD,
    LivestockStatus.DEAD,
    LivestockStatus.TRANSFERRED,
  ],
  [LivestockStatus.SICK]: [
    LivestockStatus.ACTIVE,
    LivestockStatus.QUARANTINE,
    LivestockStatus.SOLD,
    LivestockStatus.DEAD,
    LivestockStatus.TRANSFERRED,
  ],
  [LivestockStatus.QUARANTINE]: [
    LivestockStatus.ACTIVE,
    LivestockStatus.DEAD,
    LivestockStatus.TRANSFERRED,
  ],
  // Terminal statuses — no outgoing transitions
  [LivestockStatus.SOLD]: [],
  [LivestockStatus.DEAD]: [],
  [LivestockStatus.TRANSFERRED]: [],
};

/**
 * Centralized status transition — validates rules, updates livestock, creates history.
 * Used by: status module, quarantine clearance, and any future module changing status.
 */
export async function transitionTo(
  livestockId: string,
  targetStatus: LivestockStatus,
  userId: string,
  metadata: {
    reason: string;
    changed_date?: Date;
    sale_price?: number;
    sale_buyer?: string;
    notes?: string;
    farmId?: string; // optional for backward compatibility, but strongly recommended
  },
): Promise<IStatusHistory> {
  const livestock = await Livestock.findById(livestockId);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);

  // Validate farm ownership if farmId provided
  if (metadata.farmId) {
    assertLivestockBelongsToFarm(livestock, metadata.farmId, 'Ternak');
  }

  const currentStatus = livestock.current_status as LivestockStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(targetStatus)) {
    throw new AppError(
      `Transisi dari ${currentStatus} ke ${targetStatus} tidak diizinkan`,
      400,
    );
  }

  // Enforce sale metadata + withdrawal check
  if (targetStatus === LivestockStatus.SOLD) {
    if (metadata.sale_price === undefined || metadata.sale_price < 0) {
      throw new AppError('Harga jual wajib diisi untuk penjualan', 400);
    }

    // Check active withdrawal period — block sale if within withdrawal
    const activeWithdrawal = await MedicationLog.findOne({
      livestock_id: livestockId,
      withdrawal_end_date: { $gt: new Date() },
    });
    if (activeWithdrawal) {
      const endDate = (activeWithdrawal as any).withdrawal_end_date;
      const endStr = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      throw new AppError(
        `TIDAK BOLEH DIJUAL — Hewan masih dalam masa henti obat hingga ${endStr} (${(activeWithdrawal as any).medicine_name})`,
        400,
      );
    }
  }

  // Update livestock status
  livestock.current_status = targetStatus;
  await livestock.save();

  // Create status history record
  const history = await StatusHistory.create({
    livestock_id: livestockId,
    status_from: currentStatus,
    status_to: targetStatus,
    changed_date: metadata.changed_date ?? new Date(),
    reason: metadata.reason,
    sale_price: metadata.sale_price,
    sale_buyer: metadata.sale_buyer,
    changed_by: userId,
    notes: metadata.notes,
  });

  // Auto-calculate death loss when status becomes DEAD
  if (targetStatus === LivestockStatus.DEAD) {
    try {
      await calculateDeathLoss(
        livestockId,
        metadata.reason,
        metadata.changed_date ?? new Date(),
        userId,
      );
    } catch (error) {
      // Log error but don't fail the status transition
      console.error('[StatusService] Failed to calculate death loss:', error);
    }
  }

  return history;
}

export async function getByLivestock(livestockId: string, farmId?: string) {
  // Validate farm ownership if farmId provided
  if (farmId) {
    const livestock = await Livestock.findById(livestockId);
    assertLivestockBelongsToFarm(livestock, farmId, 'Ternak');
  }

  return StatusHistory.find({ livestock_id: livestockId })
    .populate('changed_by', 'name')
    .sort({ changed_date: -1 });
}

export async function getById(id: string, farmId: string) {
  const record = await StatusHistory.findById(id)
    .populate('livestock_id', 'ear_tag name farm_id')
    .populate('changed_by', 'name');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan status');
  return record;
}

/**
 * Legacy create — kept for backward compatibility.
 * Prefer transitionTo() for all new code.
 */
export async function create(input: CreateStatusHistoryInput, userId: string, farmId?: string) {
  return transitionTo(
    input.livestock_id,
    input.status_to as LivestockStatus,
    userId,
    {
      reason: input.reason,
      changed_date: input.changed_date,
      sale_price: input.sale_price,
      sale_buyer: input.sale_buyer,
      notes: input.notes,
      farmId,
    },
  );
}

export async function remove(id: string, farmId: string) {
  const record = await StatusHistory.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan status');
  await StatusHistory.findByIdAndDelete(id);
  return { message: 'Catatan status berhasil dihapus' };
}

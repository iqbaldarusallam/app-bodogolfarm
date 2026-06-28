import { QuarantineRecord } from '../../models/quarantine-record.model';
import { Livestock } from '../../models/livestock.model';
import { AppError, assertLivestockBelongsToFarm } from '../../middlewares';
import { incrementOccupancy, decrementOccupancy } from '../pens/pens.service';
import {
  CreateQuarantineRecordInput,
  UpdateQuarantineRecordInput,
  ClearanceInput,
} from './quarantine.validator';
import { QuarantineStatus, LivestockStatus, ClearanceTestResult } from '../../types/enums';
import { transitionTo } from '../status/status.service';

export async function getAll(farmId: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');

  return QuarantineRecord.find({ livestock_id: { $in: livestockIds } })
    .populate('livestock_id', 'ear_tag name')
    .populate('quarantine_pen_id', 'pen_code')
    .sort({ start_date: -1 });
}

export async function getActive(farmId: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');

  return QuarantineRecord.find({
    livestock_id: { $in: livestockIds },
    status: QuarantineStatus.ACTIVE,
  })
    .populate('livestock_id', 'ear_tag name')
    .populate('quarantine_pen_id', 'pen_code')
    .sort({ start_date: -1 });
}

export async function getById(id: string, farmId: string) {
  const record = await QuarantineRecord.findById(id)
    .populate('livestock_id', 'ear_tag name species breed farm_id')
    .populate('health_record_id', 'record_date diagnosis disease_category')
    .populate('quarantine_pen_id', 'pen_code pen_type')
    .populate('original_pen_id', 'pen_code pen_type')
    .populate('cleared_by', 'name');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan karantina');
  return record;
}

export async function create(input: CreateQuarantineRecordInput, userId: string) {
  // Load livestock to get current pen (for original_pen_id + occupancy)
  const livestock = await Livestock.findById(input.livestock_id);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);

  // Transition status to quarantine via centralized service (creates status_history)
  await transitionTo(
    input.livestock_id.toString(),
    LivestockStatus.QUARANTINE,
    userId,
    {
      reason: `Karantina: ${input.disease_suspected} — ${input.reason}`,
      changed_date: input.start_date,
    },
  );

  // Update pen occupancy: move from current pen to quarantine pen
  const currentPenId = livestock.current_pen_id?.toString();
  if (currentPenId) await decrementOccupancy(currentPenId);
  await incrementOccupancy(input.quarantine_pen_id.toString());

  return QuarantineRecord.create({
    ...input,
    original_pen_id: livestock.current_pen_id,
    status: QuarantineStatus.ACTIVE,
  });
}

export async function update(id: string, input: UpdateQuarantineRecordInput, farmId: string) {
  const existing = await QuarantineRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(existing, farmId, 'Catatan karantina');
  const record = await QuarantineRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return record;
}

export async function clearance(id: string, input: ClearanceInput, userId: string, farmId: string) {
  const record = await QuarantineRecord.findById(id)
    .populate('livestock_id', 'farm_id')
    .populate('original_pen_id', 'pen_code pen_type');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan karantina');

  if (record.status !== QuarantineStatus.ACTIVE) {
    throw new AppError('Karantina sudah selesai', 400);
  }

  // Update clearance metadata
  record.clearance_test_done = true;
  record.clearance_test_result = input.clearance_test_result;
  record.clearance_date = input.clearance_date;
  record.cleared_by = userId as any;
  record.end_date = input.clearance_date;
  if (input.notes) record.notes = input.notes;

  if (input.clearance_test_result === ClearanceTestResult.NEGATIVE) {
    // Negative → cleared, restore to original pen
    record.status = QuarantineStatus.CLEARED;

    // Get original pen from quarantine record
    const originalPenId = (record.original_pen_id as any)?._id?.toString()
      ?? record.original_pen_id?.toString();

    // Transition status back to active (creates status_history)
    await transitionTo(
      record.livestock_id.toString(),
      LivestockStatus.ACTIVE,
      userId,
      {
        reason: 'Clearance negatif — ternak dinyatakan sehat',
        changed_date: input.clearance_date,
      },
    );

    // Restore original pen and update occupancy
    const quarantinePenId = record.quarantine_pen_id.toString();
    await decrementOccupancy(quarantinePenId);

    if (originalPenId) {
      await Livestock.findByIdAndUpdate(record.livestock_id, {
        current_pen_id: originalPenId,
      });
      await incrementOccupancy(originalPenId);
    }
  } else {
    // Positive → failed (quarantine continues, no status change)
    record.status = QuarantineStatus.FAILED;
  }

  await record.save();
  return record;
}

export async function remove(id: string, farmId: string) {
  const record = await QuarantineRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan karantina');
  await QuarantineRecord.findByIdAndDelete(id);
  return { message: 'Catatan karantina berhasil dihapus' };
}

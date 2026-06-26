import { QuarantineRecord } from '../../models/quarantine-record.model';
import { Livestock } from '../../models/livestock.model';
import { AppError } from '../../middlewares';
import {
  CreateQuarantineRecordInput,
  UpdateQuarantineRecordInput,
  ClearanceInput,
} from './quarantine.validator';
import { QuarantineStatus, LivestockStatus, ClearanceTestResult } from '../../types/enums';

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

export async function getById(id: string) {
  const record = await QuarantineRecord.findById(id)
    .populate('livestock_id', 'ear_tag name species breed')
    .populate('health_record_id', 'record_date diagnosis disease_category')
    .populate('quarantine_pen_id', 'pen_code pen_type')
    .populate('cleared_by', 'name');
  if (!record) throw new AppError('Catatan karantina tidak ditemukan', 404);
  return record;
}

export async function create(input: CreateQuarantineRecordInput) {
  // Update status ternak ke quarantine
  await Livestock.findByIdAndUpdate(input.livestock_id, {
    current_status: LivestockStatus.QUARANTINE,
  });

  return QuarantineRecord.create({
    ...input,
    status: QuarantineStatus.ACTIVE,
  });
}

export async function update(id: string, input: UpdateQuarantineRecordInput) {
  const record = await QuarantineRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!record) throw new AppError('Catatan karantina tidak ditemukan', 404);
  return record;
}

export async function clearance(id: string, input: ClearanceInput, userId: string) {
  const record = await QuarantineRecord.findById(id);
  if (!record) throw new AppError('Catatan karantina tidak ditemukan', 404);

  if (record.status !== QuarantineStatus.ACTIVE) {
    throw new AppError('Karantina sudah selesai', 400);
  }

  // Update status karantina
  record.clearance_test_done = true;
  record.clearance_test_result = input.clearance_test_result;
  record.clearance_date = input.clearance_date;
  record.cleared_by = userId as any;
  record.end_date = input.clearance_date;
  if (input.notes) record.notes = input.notes;

  // Jika negatif → cleared, kembalikan status ternak ke active
  if (input.clearance_test_result === ClearanceTestResult.NEGATIVE) {
    record.status = QuarantineStatus.CLEARED;
    await Livestock.findByIdAndUpdate(record.livestock_id, {
      current_status: LivestockStatus.ACTIVE,
    });
  } else {
    // Jika positif → failed
    record.status = QuarantineStatus.FAILED;
  }

  await record.save();
  return record;
}

export async function remove(id: string) {
  const record = await QuarantineRecord.findByIdAndDelete(id);
  if (!record) throw new AppError('Catatan karantina tidak ditemukan', 404);
  return { message: 'Catatan karantina berhasil dihapus' };
}

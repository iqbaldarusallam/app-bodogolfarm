import { HealthRecord } from '../../models/health-record.model';
import { Livestock } from '../../models/livestock.model';
import { AppError, assertLivestockBelongsToFarm } from '../../middlewares';
import { CreateHealthRecordInput, UpdateHealthRecordInput } from './health.validator';

export async function getByLivestock(livestockId: string) {
  return HealthRecord.find({ livestock_id: livestockId })
    .populate('examiner', 'name')
    .sort({ record_date: -1 });
}

export async function getById(id: string, farmId: string) {
  const record = await HealthRecord.findById(id)
    .populate('livestock_id', 'farm_id')
    .populate('examiner', 'name');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan kesehatan');
  return record;
}

export async function create(input: CreateHealthRecordInput, userId: string) {
  return HealthRecord.create({
    ...input,
    examiner: userId,
  });
}

export async function update(id: string, input: UpdateHealthRecordInput, farmId: string) {
  const existing = await HealthRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(existing, farmId, 'Catatan kesehatan');
  const record = await HealthRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return record;
}

export async function remove(id: string, farmId: string) {
  const record = await HealthRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan kesehatan');
  await HealthRecord.findByIdAndDelete(id);
  return { message: 'Catatan kesehatan berhasil dihapus' };
}

export async function getInfectious(farmId: string) {
  // Cari semua livestock_id milik farm
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');

  return HealthRecord.find({
    livestock_id: { $in: livestockIds },
    is_infectious: true,
  })
    .populate('livestock_id', 'ear_tag name')
    .populate('examiner', 'name')
    .sort({ record_date: -1 });
}

export async function getFollowUps(farmId: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');

  return HealthRecord.find({
    livestock_id: { $in: livestockIds },
    follow_up_date: { $gte: new Date() },
  })
    .populate('livestock_id', 'ear_tag name')
    .sort({ follow_up_date: 1 });
}

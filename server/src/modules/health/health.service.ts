import { HealthRecord } from '../../models/health-record.model';
import { AppError } from '../../middlewares';
import { CreateHealthRecordInput, UpdateHealthRecordInput } from './health.validator';

export async function getByLivestock(livestockId: string) {
  return HealthRecord.find({ livestock_id: livestockId })
    .populate('examiner', 'name')
    .sort({ record_date: -1 });
}

export async function getById(id: string) {
  const record = await HealthRecord.findById(id).populate('examiner', 'name');
  if (!record) throw new AppError('Catatan kesehatan tidak ditemukan', 404);
  return record;
}

export async function create(input: CreateHealthRecordInput, userId: string) {
  return HealthRecord.create({
    ...input,
    examiner: userId,
  });
}

export async function update(id: string, input: UpdateHealthRecordInput) {
  const record = await HealthRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!record) throw new AppError('Catatan kesehatan tidak ditemukan', 404);
  return record;
}

export async function remove(id: string) {
  const record = await HealthRecord.findByIdAndDelete(id);
  if (!record) throw new AppError('Catatan kesehatan tidak ditemukan', 404);
  return { message: 'Catatan kesehatan berhasil dihapus' };
}

export async function getInfectious(farmId: string) {
  // Cari semua livestock_id milik farm
  const { Livestock } = await import('../../models/livestock.model');
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
  const { Livestock } = await import('../../models/livestock.model');
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');

  return HealthRecord.find({
    livestock_id: { $in: livestockIds },
    follow_up_date: { $gte: new Date() },
  })
    .populate('livestock_id', 'ear_tag name')
    .sort({ follow_up_date: 1 });
}

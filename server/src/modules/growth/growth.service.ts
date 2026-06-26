import { GrowthRecord } from '../../models/growth-record.model';
import { AppError } from '../../middlewares';
import { CreateGrowthRecordInput, UpdateGrowthRecordInput } from './growth.validator';

export async function getByLivestock(livestockId: string) {
  return GrowthRecord.find({ livestock_id: livestockId }).sort({ record_date: -1 });
}

export async function getById(id: string) {
  const record = await GrowthRecord.findById(id);
  if (!record) throw new AppError('Record pertumbuhan tidak ditemukan', 404);
  return record;
}

export async function create(input: CreateGrowthRecordInput, userId: string) {
  // Hitung ADG dari record sebelumnya
  const previousRecord = await GrowthRecord.findOne({
    livestock_id: input.livestock_id,
  }).sort({ record_date: -1 });

  let adg: number | undefined;
  if (previousRecord) {
    const daysDiff =
      (input.record_date.getTime() - previousRecord.record_date.getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysDiff > 0) {
      adg = (input.weight_kg - previousRecord.weight_kg) / daysDiff;
    }
  }

  return GrowthRecord.create({
    ...input,
    measured_by: userId,
    adg_calculated: adg,
  });
}

export async function update(id: string, input: UpdateGrowthRecordInput) {
  const record = await GrowthRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!record) throw new AppError('Record pertumbuhan tidak ditemukan', 404);
  return record;
}

export async function remove(id: string) {
  const record = await GrowthRecord.findByIdAndDelete(id);
  if (!record) throw new AppError('Record pertumbuhan tidak ditemukan', 404);
  return { message: 'Record pertumbuhan berhasil dihapus' };
}

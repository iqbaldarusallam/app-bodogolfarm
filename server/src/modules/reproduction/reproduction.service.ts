import { ReproductionRecord } from '../../models/reproduction-record.model';
import { AppError } from '../../middlewares';
import { CreateReproductionRecordInput, UpdateReproductionRecordInput } from './reproduction.validator';
import { ReproductionEventType } from '../../types/enums';

export async function getByLivestock(livestockId: string) {
  return ReproductionRecord.find({ livestock_id: livestockId })
    .populate('sire_id', 'ear_tag name')
    .populate('recorded_by', 'name')
    .sort({ event_date: -1 });
}

export async function getById(id: string) {
  const record = await ReproductionRecord.findById(id)
    .populate('livestock_id', 'ear_tag name sex')
    .populate('sire_id', 'ear_tag name')
    .populate('offspring_ids', 'ear_tag name')
    .populate('recorded_by', 'name');
  if (!record) throw new AppError('Catatan reproduksi tidak ditemukan', 404);
  return record;
}

export async function create(input: CreateReproductionRecordInput, userId: string) {
  // Hitung expected_birth_date jika ada gestation_days_expected
  let expectedBirthDate: Date | undefined;
  if (input.gestation_days_expected && input.event_date) {
    expectedBirthDate = new Date(input.event_date);
    expectedBirthDate.setDate(expectedBirthDate.getDate() + input.gestation_days_expected);
  }

  return ReproductionRecord.create({
    ...input,
    recorded_by: userId,
    expected_birth_date: expectedBirthDate,
  });
}

export async function update(id: string, input: UpdateReproductionRecordInput) {
  const record = await ReproductionRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!record) throw new AppError('Catatan reproduksi tidak ditemukan', 404);
  return record;
}

export async function remove(id: string) {
  const record = await ReproductionRecord.findByIdAndDelete(id);
  if (!record) throw new AppError('Catatan reproduksi tidak ditemukan', 404);
  return { message: 'Catatan reproduksi berhasil dihapus' };
}

export async function getPregnancies(farmId: string) {
  const { Livestock } = await import('../../models/livestock.model');
  const livestockIds = await Livestock.find({ farm_id: farmId, sex: 'female' }).distinct('_id');

  return ReproductionRecord.find({
    livestock_id: { $in: livestockIds },
    event_type: ReproductionEventType.PREGNANCY_CHECK,
    pregnancy_status: 'positive',
  })
    .populate('livestock_id', 'ear_tag name')
    .sort({ event_date: -1 });
}

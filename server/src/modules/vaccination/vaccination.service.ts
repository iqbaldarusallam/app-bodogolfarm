import { VaccinationRecord } from '../../models/vaccination-record.model';
import { AppError, assertLivestockBelongsToFarm } from '../../middlewares';
import { CreateVaccinationRecordInput, UpdateVaccinationRecordInput } from './vaccination.validator';

export async function getByLivestock(livestockId: string) {
  return VaccinationRecord.find({ livestock_id: livestockId })
    .populate('administered_by', 'name')
    .sort({ vaccination_date: -1 });
}

export async function getById(id: string, farmId: string) {
  const record = await VaccinationRecord.findById(id)
    .populate('livestock_id', 'farm_id')
    .populate('administered_by', 'name');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan vaksinasi');
  return record;
}

export async function create(input: CreateVaccinationRecordInput, userId: string) {
  // Default booster +90 hari jika tidak diisi
  const boosterDate = input.booster_due_date ?? (() => {
    const d = new Date(input.vaccination_date);
    d.setDate(d.getDate() + 90);
    return d;
  })();

  return VaccinationRecord.create({
    ...input,
    administered_by: userId,
    booster_due_date: boosterDate,
  });
}

export async function update(id: string, input: UpdateVaccinationRecordInput, farmId: string) {
  const existing = await VaccinationRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(existing, farmId, 'Catatan vaksinasi');
  const record = await VaccinationRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return record;
}

export async function remove(id: string, farmId: string) {
  const record = await VaccinationRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan vaksinasi');
  await VaccinationRecord.findByIdAndDelete(id);
  return { message: 'Catatan vaksinasi berhasil dihapus' };
}

export async function getUpcomingBoosters(farmId: string) {
  const { Livestock } = await import('../../models/livestock.model');
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');

  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

  return VaccinationRecord.find({
    livestock_id: { $in: livestockIds },
    booster_due_date: { $gte: new Date(), $lte: twoWeeksFromNow },
  })
    .populate('livestock_id', 'ear_tag name')
    .sort({ booster_due_date: 1 });
}

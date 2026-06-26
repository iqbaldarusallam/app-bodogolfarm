import { VaccinationRecord } from '../../models/vaccination-record.model';
import { AppError } from '../../middlewares';
import { CreateVaccinationRecordInput, UpdateVaccinationRecordInput } from './vaccination.validator';

export async function getByLivestock(livestockId: string) {
  return VaccinationRecord.find({ livestock_id: livestockId })
    .populate('administered_by', 'name')
    .sort({ vaccination_date: -1 });
}

export async function getById(id: string) {
  const record = await VaccinationRecord.findById(id).populate('administered_by', 'name');
  if (!record) throw new AppError('Catatan vaksinasi tidak ditemukan', 404);
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

export async function update(id: string, input: UpdateVaccinationRecordInput) {
  const record = await VaccinationRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!record) throw new AppError('Catatan vaksinasi tidak ditemukan', 404);
  return record;
}

export async function remove(id: string) {
  const record = await VaccinationRecord.findByIdAndDelete(id);
  if (!record) throw new AppError('Catatan vaksinasi tidak ditemukan', 404);
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

import { MedicationLog } from '../../models/medication-log.model';
import { AppError } from '../../middlewares';
import { CreateMedicationLogInput, UpdateMedicationLogInput } from './medication.validator';

export async function getByLivestock(livestockId: string) {
  return MedicationLog.find({ livestock_id: livestockId })
    .populate('health_record_id', 'record_date diagnosis')
    .populate('administered_by', 'name')
    .sort({ start_date: -1 });
}

export async function getById(id: string) {
  const log = await MedicationLog.findById(id)
    .populate('health_record_id', 'record_date diagnosis')
    .populate('administered_by', 'name');
  if (!log) throw new AppError('Log obat tidak ditemukan', 404);
  return log;
}

export async function create(input: CreateMedicationLogInput, userId: string) {
  // Hitung withdrawal_end_date jika ada withdrawal_period_days
  let withdrawalEndDate: Date | undefined;
  if (input.withdrawal_period_days && input.withdrawal_period_days > 0) {
    withdrawalEndDate = new Date(input.start_date);
    withdrawalEndDate.setDate(withdrawalEndDate.getDate() + input.withdrawal_period_days);
  }

  return MedicationLog.create({
    ...input,
    administered_by: userId,
    withdrawal_end_date: withdrawalEndDate,
  });
}

export async function update(id: string, input: UpdateMedicationLogInput) {
  const log = await MedicationLog.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!log) throw new AppError('Log obat tidak ditemukan', 404);
  return log;
}

export async function remove(id: string) {
  const log = await MedicationLog.findByIdAndDelete(id);
  if (!log) throw new AppError('Log obat tidak ditemukan', 404);
  return { message: 'Log obat berhasil dihapus' };
}

export async function getActiveWithdrawals(farmId: string) {
  const { Livestock } = await import('../../models/livestock.model');
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');

  return MedicationLog.find({
    livestock_id: { $in: livestockIds },
    withdrawal_end_date: { $gte: new Date() },
  })
    .populate('livestock_id', 'ear_tag name')
    .sort({ withdrawal_end_date: 1 });
}

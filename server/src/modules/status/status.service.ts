import { StatusHistory } from '../../models/status-history.model';
import { Livestock } from '../../models/livestock.model';
import { AppError } from '../../middlewares';
import { CreateStatusHistoryInput } from './status.validator';

export async function getByLivestock(livestockId: string) {
  return StatusHistory.find({ livestock_id: livestockId })
    .populate('changed_by', 'name')
    .sort({ changed_date: -1 });
}

export async function getById(id: string) {
  const record = await StatusHistory.findById(id)
    .populate('livestock_id', 'ear_tag name')
    .populate('changed_by', 'name');
  if (!record) throw new AppError('Catatan status tidak ditemukan', 404);
  return record;
}

export async function create(input: CreateStatusHistoryInput, userId: string) {
  // Update status ternak
  const livestock = await Livestock.findById(input.livestock_id);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);

  const oldStatus = livestock.current_status;
  livestock.current_status = input.status_to as any;
  await livestock.save();

  return StatusHistory.create({
    ...input,
    status_from: oldStatus,
    changed_by: userId,
  });
}

export async function remove(id: string) {
  const record = await StatusHistory.findByIdAndDelete(id);
  if (!record) throw new AppError('Catatan status tidak ditemukan', 404);
  return { message: 'Catatan status berhasil dihapus' };
}

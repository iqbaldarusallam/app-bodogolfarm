import { FeedingLog } from '../../models/feeding-log.model';
import { FeedMaster } from '../../models/feed-master.model';
import { AppError } from '../../middlewares';
import { CreateFeedingLogInput, UpdateFeedingLogInput } from './feeding.validator';

export async function getByLivestock(livestockId: string) {
  return FeedingLog.find({ livestock_id: livestockId })
    .populate('feed_master_id', 'feed_name feed_type unit')
    .sort({ feed_date: -1 });
}

export async function getById(id: string) {
  const log = await FeedingLog.findById(id).populate(
    'feed_master_id',
    'feed_name feed_type dry_matter_pct price_per_unit unit',
  );
  if (!log) throw new AppError('Log pakan tidak ditemukan', 404);
  return log;
}

export async function create(input: CreateFeedingLogInput, userId: string) {
  // Ambil data master pakan untuk kalkulasi
  const feedMaster = await FeedMaster.findById(input.feed_master_id);
  if (!feedMaster) throw new AppError('Master pakan tidak ditemukan', 404);

  // Hitung DMI: amount_consumed_kg × (dry_matter_pct / 100)
  const amountConsumed = input.amount_consumed_kg ?? input.amount_given_kg;
  const dmi = amountConsumed * (feedMaster.dry_matter_pct / 100);

  // Hitung biaya: amount_given_kg × price_per_unit
  const cost = feedMaster.price_per_unit
    ? input.amount_given_kg * feedMaster.price_per_unit
    : undefined;

  return FeedingLog.create({
    ...input,
    recorded_by: userId,
    dmi_calculated: dmi,
    cost_calculated: cost,
  });
}

export async function update(id: string, input: UpdateFeedingLogInput) {
  const log = await FeedingLog.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!log) throw new AppError('Log pakan tidak ditemukan', 404);
  return log;
}

export async function remove(id: string) {
  const log = await FeedingLog.findByIdAndDelete(id);
  if (!log) throw new AppError('Log pakan tidak ditemukan', 404);
  return { message: 'Log pakan berhasil dihapus' };
}

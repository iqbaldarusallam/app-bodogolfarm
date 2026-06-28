import { FeedingLog } from '../../models/feeding-log.model';
import { FeedMaster } from '../../models/feed-master.model';
import { AppError, assertLivestockBelongsToFarm } from '../../middlewares';
import { CreateFeedingLogInput, UpdateFeedingLogInput } from './feeding.validator';

export async function getByLivestock(livestockId: string) {
  return FeedingLog.find({ livestock_id: livestockId })
    .populate('feed_master_id', 'feed_name feed_type unit')
    .sort({ feed_date: -1 });
}

export async function getById(id: string, farmId: string) {
  const log = await FeedingLog.findById(id)
    .populate('livestock_id', 'farm_id')
    .populate(
      'feed_master_id',
      'feed_name feed_type dry_matter_pct price_per_unit unit',
    );
  assertLivestockBelongsToFarm(log, farmId, 'Log pakan');
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

export async function update(id: string, input: UpdateFeedingLogInput, farmId: string) {
  const existing = await FeedingLog.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(existing, farmId, 'Log pakan');
  const log = await FeedingLog.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return log;
}

export async function remove(id: string, farmId: string) {
  const log = await FeedingLog.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(log, farmId, 'Log pakan');
  await FeedingLog.findByIdAndDelete(id);
  return { message: 'Log pakan berhasil dihapus' };
}

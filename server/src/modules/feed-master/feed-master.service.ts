import { FeedMaster } from '../../models/feed-master.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';
import { CreateFeedMasterInput, UpdateFeedMasterInput } from './feed-master.validator';

export async function getAll(farmId: string) {
  return FeedMaster.find({ farm_id: farmId }).sort({ feed_name: 1 });
}

export async function getActive(farmId: string) {
  return FeedMaster.find({ farm_id: farmId, is_active: true }).sort({ feed_name: 1 });
}

export async function getById(id: string, farmId: string) {
  const feed = await FeedMaster.findById(id);
  assertBelongsToFarm(feed, farmId, 'Master pakan');
  return feed;
}

export async function create(input: CreateFeedMasterInput) {
  const existing = await FeedMaster.findOne({
    farm_id: input.farm_id,
    feed_name: input.feed_name,
  });
  if (existing) throw new AppError('Nama pakan sudah ada di farm ini', 409);
  return FeedMaster.create(input);
}

export async function update(id: string, input: UpdateFeedMasterInput, farmId: string) {
  const existing = await FeedMaster.findById(id);
  assertBelongsToFarm(existing, farmId, 'Master pakan');
  const feed = await FeedMaster.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return feed;
}

export async function remove(id: string, farmId: string) {
  const feed = await FeedMaster.findById(id);
  assertBelongsToFarm(feed, farmId, 'Master pakan');
  await FeedMaster.findByIdAndDelete(id);
  return { message: 'Master pakan berhasil dihapus' };
}

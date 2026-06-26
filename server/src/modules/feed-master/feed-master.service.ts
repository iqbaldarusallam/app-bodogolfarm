import { FeedMaster } from '../../models/feed-master.model';
import { AppError } from '../../middlewares';
import { CreateFeedMasterInput, UpdateFeedMasterInput } from './feed-master.validator';

export async function getAll(farmId: string) {
  return FeedMaster.find({ farm_id: farmId }).sort({ feed_name: 1 });
}

export async function getActive(farmId: string) {
  return FeedMaster.find({ farm_id: farmId, is_active: true }).sort({ feed_name: 1 });
}

export async function getById(id: string) {
  const feed = await FeedMaster.findById(id);
  if (!feed) throw new AppError('Master pakan tidak ditemukan', 404);
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

export async function update(id: string, input: UpdateFeedMasterInput) {
  const feed = await FeedMaster.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!feed) throw new AppError('Master pakan tidak ditemukan', 404);
  return feed;
}

export async function remove(id: string) {
  const feed = await FeedMaster.findByIdAndDelete(id);
  if (!feed) throw new AppError('Master pakan tidak ditemukan', 404);
  return { message: 'Master pakan berhasil dihapus' };
}

import { OfflineQueue } from '../../models/offline-queue.model';
import { SyncStatus } from '../../types/enums';

export async function getPending() {
  return OfflineQueue.find({ sync_status: SyncStatus.PENDING })
    .sort({ created_at: 1 })
    .limit(50);
}

export async function pushToQueue(payload: {
  collection: string;
  operation: string;
  payload: Record<string, unknown>;
}) {
  return OfflineQueue.create({
    collection: payload.collection,
    operation: payload.operation,
    payload: payload.payload,
    sync_status: SyncStatus.PENDING,
  });
}

export async function markSynced(id: string) {
  return OfflineQueue.findByIdAndUpdate(
    id,
    { sync_status: SyncStatus.SYNCED },
    { new: true },
  );
}

export async function markFailed(id: string) {
  return OfflineQueue.findByIdAndUpdate(
    id,
    {
      sync_status: SyncStatus.FAILED,
      $inc: { retry_count: 1 },
    },
    { new: true },
  );
}

export async function getStats() {
  const [pending, synced, failed] = await Promise.all([
    OfflineQueue.countDocuments({ sync_status: SyncStatus.PENDING }),
    OfflineQueue.countDocuments({ sync_status: SyncStatus.SYNCED }),
    OfflineQueue.countDocuments({ sync_status: SyncStatus.FAILED }),
  ]);

  return { pending, synced, failed };
}

export async function retryFailed() {
  const failed = await OfflineQueue.find({
    sync_status: SyncStatus.FAILED,
    retry_count: { $lt: 3 },
  });

  await OfflineQueue.updateMany(
    { _id: { $in: failed.map((f) => f._id) } },
    { sync_status: SyncStatus.PENDING },
  );

  return { retried: failed.length };
}

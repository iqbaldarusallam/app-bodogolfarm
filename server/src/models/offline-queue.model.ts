import mongoose, { Schema, Document, Model } from 'mongoose';
import { SyncOperation, SyncStatus } from '../types/enums';

// ── Interface ──
export interface IOfflineQueue extends Document {
  _id: mongoose.Types.ObjectId;
  target_collection: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  created_at: Date;
  retry_count: number;
  sync_status: SyncStatus;
}

// ── Schema ──
const offlineQueueSchema = new Schema<IOfflineQueue>(
  {
    target_collection: {
      type: String,
      required: [true, 'Nama collection wajib diisi'],
      trim: true,
    },
    operation: {
      type: String,
      required: [true, 'Jenis operasi wajib diisi'],
      enum: {
        values: Object.values(SyncOperation),
        message: 'Jenis operasi tidak valid: {VALUE}',
      },
    },
    payload: {
      type: Schema.Types.Mixed,
      required: [true, 'Payload wajib diisi'],
    },
    retry_count: {
      type: Number,
      default: 0,
      min: [0, 'Jumlah retry tidak boleh negatif'],
    },
    sync_status: {
      type: String,
      required: [true, 'Status sync wajib diisi'],
      enum: {
        values: Object.values(SyncStatus),
        message: 'Status sync tidak valid: {VALUE}',
      },
      default: SyncStatus.PENDING,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  },
);

// ── Indexes ──
offlineQueueSchema.index({ sync_status: 1, created_at: 1 });
offlineQueueSchema.index({ target_collection: 1, operation: 1 });

// ── Model ──
export const OfflineQueue: Model<IOfflineQueue> = mongoose.model<IOfflineQueue>(
  'OfflineQueue',
  offlineQueueSchema,
);

import mongoose, { Schema, Document, Model } from 'mongoose';
import { LivestockStatus } from '../types/enums';

// ── Interface ──
export interface IStatusHistory extends Document {
  _id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  status_from: LivestockStatus;
  status_to: LivestockStatus;
  changed_date: Date;
  reason: string;
  sale_price?: number;
  sale_buyer?: string;
  changed_by: mongoose.Types.ObjectId;
  notes?: string;
  created_at: Date;
}

// ── Schema ──
const statusHistorySchema = new Schema<IStatusHistory>(
  {
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    status_from: {
      type: String,
      required: [true, 'Status asal wajib diisi'],
      enum: {
        values: Object.values(LivestockStatus),
        message: 'Status asal tidak valid: {VALUE}',
      },
    },
    status_to: {
      type: String,
      required: [true, 'Status tujuan wajib diisi'],
      enum: {
        values: Object.values(LivestockStatus),
        message: 'Status tujuan tidak valid: {VALUE}',
      },
    },
    changed_date: {
      type: Date,
      required: [true, 'Tanggal perubahan wajib diisi'],
    },
    reason: {
      type: String,
      required: [true, 'Alasan perubahan status wajib diisi'],
      trim: true,
    },
    sale_price: {
      type: Number,
      min: [0, 'Harga jual tidak boleh negatif'],
      validate: {
        validator: function (this: IStatusHistory, v: number | undefined) {
          if (this.status_to === LivestockStatus.SOLD) {
            return v !== undefined && v >= 0;
          }
          return true;
        },
        message: 'Harga jual wajib diisi untuk status sold',
      },
    },
    sale_buyer: {
      type: String,
      trim: true,
    },
    changed_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Petugas yang mengubah status wajib diisi'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  },
);

// ── Indexes ──
statusHistorySchema.index({ livestock_id: 1, changed_date: -1 });
statusHistorySchema.index({ status_to: 1, changed_date: -1 });
statusHistorySchema.index({ changed_by: 1 });

// ── Model ──
export const StatusHistory: Model<IStatusHistory> =
  mongoose.model<IStatusHistory>('StatusHistory', statusHistorySchema);

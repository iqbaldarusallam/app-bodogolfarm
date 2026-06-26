import mongoose, { Schema, Document, Model } from 'mongoose';
import { FeedingTime, AppetiteResponse } from '../types/enums';

// ── Interface ──
export interface IFeedingLog extends Document {
  _id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  feed_master_id: mongoose.Types.ObjectId;
  feed_date: Date;
  feeding_time: FeedingTime;
  amount_given_kg: number;
  amount_consumed_kg?: number;
  appetite_response: AppetiteResponse;
  dmi_calculated?: number;
  cost_calculated?: number;
  recorded_by: mongoose.Types.ObjectId;
  notes?: string;
  created_at: Date;
}

// ── Schema ──
const feedingLogSchema = new Schema<IFeedingLog>(
  {
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    feed_master_id: {
      type: Schema.Types.ObjectId,
      ref: 'FeedMaster',
      required: [true, 'Master pakan wajib diisi'],
    },
    feed_date: {
      type: Date,
      required: [true, 'Tanggal pakan wajib diisi'],
    },
    feeding_time: {
      type: String,
      required: [true, 'Waktu pakan wajib diisi'],
      enum: {
        values: Object.values(FeedingTime),
        message: 'Waktu pakan tidak valid: {VALUE}',
      },
    },
    amount_given_kg: {
      type: Number,
      required: [true, 'Jumlah pemberian wajib diisi'],
      min: [0.01, 'Jumlah pemberian harus lebih dari 0'],
    },
    amount_consumed_kg: {
      type: Number,
      min: [0, 'Jumlah konsumsi tidak boleh negatif'],
      validate: {
        validator: function (this: IFeedingLog, v: number) {
          return v <= this.amount_given_kg;
        },
        message: 'Jumlah konsumsi tidak boleh melebihi jumlah pemberian',
      },
    },
    appetite_response: {
      type: String,
      required: [true, 'Respon nafsu makan wajib diisi'],
      enum: {
        values: Object.values(AppetiteResponse),
        message: 'Respon nafsu makan tidak valid: {VALUE}',
      },
    },
    dmi_calculated: {
      type: Number,
      min: [0, 'DMI tidak boleh negatif'],
    },
    cost_calculated: {
      type: Number,
      min: [0, 'Biaya tidak boleh negatif'],
    },
    recorded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Petugas pencatat wajib diisi'],
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
feedingLogSchema.index({ livestock_id: 1, feed_date: -1 });
feedingLogSchema.index({ livestock_id: 1, feeding_time: 1, feed_date: -1 });
feedingLogSchema.index({ feed_master_id: 1 });

// ── Model ──
export const FeedingLog: Model<IFeedingLog> = mongoose.model<IFeedingLog>(
  'FeedingLog',
  feedingLogSchema,
);

import mongoose, { Schema, Document, Model } from 'mongoose';
import { FeedType, FeedSource, FeedUnit } from '../types/enums';

// ── Interface ──
export interface IFeedMaster extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  feed_name: string;
  feed_type: FeedType;
  source: FeedSource;
  dry_matter_pct: number;
  crude_protein_pct?: number;
  metabolizable_energy?: number;
  unit: FeedUnit;
  price_per_unit?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const feedMasterSchema = new Schema<IFeedMaster>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    feed_name: {
      type: String,
      required: [true, 'Nama pakan wajib diisi'],
      trim: true,
    },
    feed_type: {
      type: String,
      required: [true, 'Jenis pakan wajib diisi'],
      enum: {
        values: Object.values(FeedType),
        message: 'Jenis pakan tidak valid: {VALUE}',
      },
    },
    source: {
      type: String,
      required: [true, 'Sumber pakan wajib diisi'],
      enum: {
        values: Object.values(FeedSource),
        message: 'Sumber pakan tidak valid: {VALUE}',
      },
    },
    dry_matter_pct: {
      type: Number,
      required: [true, 'Persentase bahan kering wajib diisi'],
      min: [0, 'BK tidak boleh negatif'],
      max: [100, 'BK maksimal 100%'],
    },
    crude_protein_pct: {
      type: Number,
      min: [0, 'PK tidak boleh negatif'],
      max: [100, 'PK maksimal 100%'],
    },
    metabolizable_energy: {
      type: Number,
      min: [0, 'EM tidak boleh negatif'],
    },
    unit: {
      type: String,
      required: [true, 'Satuan wajib diisi'],
      enum: {
        values: Object.values(FeedUnit),
        message: 'Satuan tidak valid: {VALUE}',
      },
    },
    price_per_unit: {
      type: Number,
      min: [0, 'Harga tidak boleh negatif'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

// ── Indexes ──
feedMasterSchema.index({ farm_id: 1, feed_name: 1 }, { unique: true });
feedMasterSchema.index({ farm_id: 1, is_active: 1 });
feedMasterSchema.index({ farm_id: 1, feed_type: 1 });

// ── Model ──
export const FeedMaster: Model<IFeedMaster> = mongoose.model<IFeedMaster>(
  'FeedMaster',
  feedMasterSchema,
);

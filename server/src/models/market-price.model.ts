import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IMarketPrice extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  category: string;
  breed?: string;
  price_per_kg: number;
  currency: string;
  effective_date: Date;
  is_active: boolean;
  source?: string;
  notes?: string;
  recorded_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const marketPriceSchema = new Schema<IMarketPrice>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    category: {
      type: String,
      required: [true, 'Kategori harga wajib diisi'],
      enum: {
        values: ['jantan_dewasa', 'betina_dewasa', 'anak_jantan', 'anak_betina', 'umum'],
        message: 'Kategori harga tidak valid: {VALUE}',
      },
    },
    breed: {
      type: String,
      trim: true,
    },
    price_per_kg: {
      type: Number,
      required: [true, 'Harga per kg wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    currency: {
      type: String,
      default: 'IDR',
    },
    effective_date: {
      type: Date,
      required: [true, 'Tanggal berlaku wajib diisi'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    recorded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

// ── Indexes ──
marketPriceSchema.index({ farm_id: 1, category: 1, is_active: 1 });
marketPriceSchema.index({ farm_id: 1, effective_date: -1 });

// ── Model ──
export const MarketPrice: Model<IMarketPrice> = mongoose.model<IMarketPrice>(
  'MarketPrice',
  marketPriceSchema,
);

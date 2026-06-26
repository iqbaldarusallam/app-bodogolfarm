import mongoose, { Schema, Document, Model } from 'mongoose';
import { PenType } from '../types/enums';

// ── Interface ──
export interface IPen extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  pen_code: string;
  pen_type: PenType;
  capacity: number;
  current_count: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const penSchema = new Schema<IPen>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    pen_code: {
      type: String,
      required: [true, 'Kode kandang wajib diisi'],
      trim: true,
    },
    pen_type: {
      type: String,
      required: [true, 'Tipe kandang wajib diisi'],
      enum: {
        values: Object.values(PenType),
        message: 'Tipe kandang tidak valid: {VALUE}',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Kapasitas wajib diisi'],
      min: [1, 'Kapasitas minimal 1'],
    },
    current_count: {
      type: Number,
      default: 0,
      min: [0, 'Jumlah ternak tidak boleh negatif'],
    },
    description: {
      type: String,
      trim: true,
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
penSchema.index({ farm_id: 1, pen_code: 1 }, { unique: true });
penSchema.index({ farm_id: 1, pen_type: 1 });
penSchema.index({ farm_id: 1, is_active: 1 });

// ── Model ──
export const Pen: Model<IPen> = mongoose.model<IPen>('Pen', penSchema);

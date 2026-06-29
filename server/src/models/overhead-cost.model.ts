import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IOverheadCost extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: Date;
  allocation_level: 'farm' | 'cage';
  allocated_cage_id?: mongoose.Types.ObjectId;
  is_recurring: boolean;
  recurring_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  next_recurring_date?: Date;
  reference_number?: string;
  attachment_url?: string;
  notes?: string;
  recorded_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const overheadCostSchema = new Schema<IOverheadCost>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Kategori wajib diisi'],
      enum: {
        values: ['tenaga_kerja', 'utilitas', 'perawatan_kandang', 'sewa_aset', 'lainnya'],
        message: 'Kategori tidak valid: {VALUE}',
      },
    },
    description: {
      type: String,
      required: [true, 'Deskripsi wajib diisi'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Jumlah biaya wajib diisi'],
      min: [0, 'Tidak boleh negatif'],
    },
    currency: {
      type: String,
      default: 'IDR',
    },
    expense_date: {
      type: Date,
      required: true,
    },
    allocation_level: {
      type: String,
      enum: ['farm', 'cage'],
      default: 'farm',
    },
    allocated_cage_id: {
      type: Schema.Types.ObjectId,
      ref: 'Pen',
    },
    is_recurring: {
      type: Boolean,
      default: false,
    },
    recurring_frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
    },
    next_recurring_date: {
      type: Date,
    },
    reference_number: {
      type: String,
      trim: true,
    },
    attachment_url: {
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
overheadCostSchema.index({ farm_id: 1, expense_date: -1 });
overheadCostSchema.index({ farm_id: 1, category: 1 });
overheadCostSchema.index({ is_recurring: 1, next_recurring_date: 1 });

// ── Model ──
export const OverheadCost: Model<IOverheadCost> = mongoose.model<IOverheadCost>(
  'OverheadCost',
  overheadCostSchema,
);

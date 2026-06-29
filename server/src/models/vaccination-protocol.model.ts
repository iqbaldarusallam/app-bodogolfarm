import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IVaccinationProtocol extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  name: string;
  vaccine_item_id?: mongoose.Types.ObjectId;
  target_disease: string;
  interval_days: number;
  minimum_age_days: number;
  requires_booster: boolean;
  booster_interval_days?: number;
  applicable_gender: 'male' | 'female' | 'all';
  is_active: boolean;
  priority: number;
  notes?: string;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const vaccinationProtocolSchema = new Schema<IVaccinationProtocol>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nama protokol wajib diisi'],
      trim: true,
    },
    vaccine_item_id: {
      type: Schema.Types.ObjectId,
      ref: 'VaccineItem',
    },
    target_disease: {
      type: String,
      trim: true,
    },
    interval_days: {
      type: Number,
      required: [true, 'Interval wajib diisi'],
      min: [1, 'Minimal 1 hari'],
    },
    minimum_age_days: {
      type: Number,
      default: 0,
      min: [0, 'Tidak boleh negatif'],
    },
    requires_booster: {
      type: Boolean,
      default: false,
    },
    booster_interval_days: {
      type: Number,
      min: [1, 'Minimal 1 hari'],
    },
    applicable_gender: {
      type: String,
      enum: ['male', 'female', 'all'],
      default: 'all',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
    notes: {
      type: String,
      trim: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

// ── Indexes ──
vaccinationProtocolSchema.index({ farm_id: 1, is_active: 1, priority: 1 });

// ── Model ──
export const VaccinationProtocol: Model<IVaccinationProtocol> = mongoose.model<IVaccinationProtocol>(
  'VaccinationProtocol',
  vaccinationProtocolSchema,
);

import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IGrowthRecord extends Document {
  _id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  record_date: Date;
  weight_kg: number;
  bcs: number;
  height_cm?: number;
  chest_girth_cm?: number;
  adg_calculated?: number;
  measured_by: mongoose.Types.ObjectId;
  notes?: string;
  created_at: Date;
}

// ── Schema ──
const growthRecordSchema = new Schema<IGrowthRecord>(
  {
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    record_date: {
      type: Date,
      required: [true, 'Tanggal timbang wajib diisi'],
    },
    weight_kg: {
      type: Number,
      required: [true, 'Berat badan wajib diisi'],
      min: [0.1, 'Berat badan harus lebih dari 0'],
    },
    bcs: {
      type: Number,
      required: [true, 'Body Condition Score wajib diisi'],
      min: [1, 'BCS minimal 1'],
      max: [5, 'BCS maksimal 5'],
    },
    height_cm: {
      type: Number,
      min: [0, 'Tinggi badan tidak boleh negatif'],
    },
    chest_girth_cm: {
      type: Number,
      min: [0, 'Lingkar dada tidak boleh negatif'],
    },
    adg_calculated: {
      type: Number,
    },
    measured_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Petugas penimbang wajib diisi'],
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
growthRecordSchema.index({ livestock_id: 1, record_date: -1 });
growthRecordSchema.index({ livestock_id: 1, created_at: -1 });

// ── Model ──
export const GrowthRecord: Model<IGrowthRecord> = mongoose.model<IGrowthRecord>(
  'GrowthRecord',
  growthRecordSchema,
);

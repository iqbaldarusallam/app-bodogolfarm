import mongoose, { Schema, Document, Model } from 'mongoose';
import { VaccinationRoute } from '../types/enums';

// ── Interface ──
export interface IVaccinationRecord extends Document {
  _id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  vaccine_name: string;
  disease_target: string;
  dosage: number;
  dosage_unit: string;
  route: VaccinationRoute;
  vaccination_date: Date;
  booster_due_date: Date;
  batch_number?: string;
  manufacturer?: string;
  administered_by: mongoose.Types.ObjectId;
  notes?: string;
  created_at: Date;
}

// ── Schema ──
const vaccinationRecordSchema = new Schema<IVaccinationRecord>(
  {
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    vaccine_name: {
      type: String,
      required: [true, 'Nama vaksin wajib diisi'],
      trim: true,
    },
    disease_target: {
      type: String,
      required: [true, 'Penyakit target wajib diisi'],
      trim: true,
    },
    dosage: {
      type: Number,
      required: [true, 'Dosis wajib diisi'],
      min: [0.01, 'Dosis harus lebih dari 0'],
    },
    dosage_unit: {
      type: String,
      required: [true, 'Satuan dosis wajib diisi'],
      trim: true,
    },
    route: {
      type: String,
      required: [true, 'Rute pemberian wajib diisi'],
      enum: {
        values: Object.values(VaccinationRoute),
        message: 'Rute pemberian tidak valid: {VALUE}',
      },
    },
    vaccination_date: {
      type: Date,
      required: [true, 'Tanggal vaksinasi wajib diisi'],
    },
    booster_due_date: {
      type: Date,
      required: [true, 'Tanggal booster wajib diisi'],
      validate: {
        validator: function (this: IVaccinationRecord, v: Date) {
          return v >= this.vaccination_date;
        },
        message: 'Tanggal booster harus setelah tanggal vaksinasi',
      },
    },
    batch_number: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    administered_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Petugas vaksin wajib diisi'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ──
vaccinationRecordSchema.index({ livestock_id: 1, vaccination_date: -1 });
vaccinationRecordSchema.index({ booster_due_date: 1 });
vaccinationRecordSchema.index({ livestock_id: 1, vaccine_name: 1 });

// ── Hooks: default booster +90 hari ──
vaccinationRecordSchema.pre('save', function (next) {
  if (!this.booster_due_date && this.vaccination_date) {
    const booster = new Date(this.vaccination_date);
    booster.setDate(booster.getDate() + 90);
    this.booster_due_date = booster;
  }
  next();
});

// ── Virtuals ──
vaccinationRecordSchema.virtual('booster_due_soon').get(function () {
  if (!this.booster_due_date) return false;
  const now = new Date();
  const diffDays =
    (this.booster_due_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 14;
});

// ── Model ──
export const VaccinationRecord: Model<IVaccinationRecord> =
  mongoose.model<IVaccinationRecord>(
    'VaccinationRecord',
    vaccinationRecordSchema,
  );

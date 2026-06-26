import mongoose, { Schema, Document, Model } from 'mongoose';
import { RumenMotility, DiseaseCategory } from '../types/enums';

// ── Interface ──
export interface IHealthRecord extends Document {
  _id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  record_date: Date;
  examiner: mongoose.Types.ObjectId;
  chief_complaint: string;
  symptoms: string[];
  body_temp_celsius?: number;
  heart_rate_bpm?: number;
  respiratory_rate?: number;
  rumen_motility?: RumenMotility;
  examination_findings?: string;
  diagnosis?: string;
  diagnosis_code?: string;
  is_infectious: boolean;
  disease_category: DiseaseCategory;
  action_taken?: string;
  referral_needed: boolean;
  follow_up_date?: Date;
  created_at: Date;
}

// ── Schema ──
const healthRecordSchema = new Schema<IHealthRecord>(
  {
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    record_date: {
      type: Date,
      required: [true, 'Tanggal pemeriksaan wajib diisi'],
    },
    examiner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pemeriksa wajib diisi'],
    },
    chief_complaint: {
      type: String,
      required: [true, 'Keluhan utama wajib diisi'],
      trim: true,
    },
    symptoms: {
      type: [String],
      required: [true, 'Gejala wajib diisi'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'Minimal satu gejala harus dipilih',
      },
    },
    body_temp_celsius: {
      type: Number,
      min: [35, 'Suhu tubuh minimal 35°C'],
      max: [45, 'Suhu tubuh maksimal 45°C'],
    },
    heart_rate_bpm: {
      type: Number,
      min: [1, 'Detak jantung harus positif'],
    },
    respiratory_rate: {
      type: Number,
      min: [1, 'Frekuensi napas harus positif'],
    },
    rumen_motility: {
      type: String,
      enum: {
        values: Object.values(RumenMotility),
        message: 'Motilitas rumen tidak valid: {VALUE}',
      },
    },
    examination_findings: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    diagnosis_code: {
      type: String,
      trim: true,
    },
    is_infectious: {
      type: Boolean,
      default: false,
    },
    disease_category: {
      type: String,
      required: [true, 'Kategori penyakit wajib diisi'],
      enum: {
        values: Object.values(DiseaseCategory),
        message: 'Kategori penyakit tidak valid: {VALUE}',
      },
    },
    action_taken: {
      type: String,
      trim: true,
    },
    referral_needed: {
      type: Boolean,
      default: false,
    },
    follow_up_date: {
      type: Date,
      validate: {
        validator: function (this: IHealthRecord, v: Date) {
          return !v || v >= this.record_date;
        },
        message: 'Tanggal kontrol harus setelah tanggal pemeriksaan',
      },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  },
);

// ── Indexes ──
healthRecordSchema.index({ livestock_id: 1, record_date: -1 });
healthRecordSchema.index({ livestock_id: 1, is_infectious: 1 });
healthRecordSchema.index({ disease_category: 1, record_date: -1 });
healthRecordSchema.index({ follow_up_date: 1 });

// ── Model ──
export const HealthRecord: Model<IHealthRecord> = mongoose.model<IHealthRecord>(
  'HealthRecord',
  healthRecordSchema,
);

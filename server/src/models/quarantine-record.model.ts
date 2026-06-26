import mongoose, { Schema, Document, Model } from 'mongoose';
import { QuarantineStatus, ClearanceTestResult } from '../types/enums';

// ── Interface ──
export interface IQuarantineRecord extends Document {
  _id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  health_record_id: mongoose.Types.ObjectId;
  quarantine_pen_id: mongoose.Types.ObjectId;
  start_date: Date;
  expected_duration_days: number;
  end_date?: Date;
  reason: string;
  disease_suspected: string;
  clearance_test_done: boolean;
  clearance_test_result: ClearanceTestResult;
  clearance_date?: Date;
  status: QuarantineStatus;
  cleared_by?: mongoose.Types.ObjectId;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const quarantineRecordSchema = new Schema<IQuarantineRecord>(
  {
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    health_record_id: {
      type: Schema.Types.ObjectId,
      ref: 'HealthRecord',
      required: [true, 'Catatan kesehatan asal wajib diisi'],
    },
    quarantine_pen_id: {
      type: Schema.Types.ObjectId,
      ref: 'Pen',
      required: [true, 'Kandang karantina wajib diisi'],
    },
    start_date: {
      type: Date,
      required: [true, 'Tanggal mulai karantina wajib diisi'],
    },
    expected_duration_days: {
      type: Number,
      required: [true, 'Durasi karantina wajib diisi'],
      min: [1, 'Durasi karantina minimal 1 hari'],
    },
    end_date: {
      type: Date,
    },
    reason: {
      type: String,
      required: [true, 'Alasan karantina wajib diisi'],
      trim: true,
    },
    disease_suspected: {
      type: String,
      required: [true, 'Penyakit yang dicurigai wajib diisi'],
      trim: true,
    },
    clearance_test_done: {
      type: Boolean,
      default: false,
    },
    clearance_test_result: {
      type: String,
      required: [true, 'Hasil uji clearance wajib diisi'],
      enum: {
        values: Object.values(ClearanceTestResult),
        message: 'Hasil uji clearance tidak valid: {VALUE}',
      },
      default: ClearanceTestResult.PENDING,
    },
    clearance_date: {
      type: Date,
    },
    status: {
      type: String,
      required: [true, 'Status karantina wajib diisi'],
      enum: {
        values: Object.values(QuarantineStatus),
        message: 'Status karantina tidak valid: {VALUE}',
      },
      default: QuarantineStatus.ACTIVE,
    },
    cleared_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ──
quarantineRecordSchema.index({ livestock_id: 1, start_date: -1 });
quarantineRecordSchema.index({ status: 1, clearance_test_result: 1 });
quarantineRecordSchema.index({ quarantine_pen_id: 1 });
quarantineRecordSchema.index({ clearance_date: 1 });

// ── Virtuals ──
quarantineRecordSchema.virtual('is_overdue').get(function () {
  if (this.status !== QuarantineStatus.ACTIVE) return false;
  const endDate = new Date(this.start_date);
  endDate.setDate(endDate.getDate() + this.expected_duration_days);
  return new Date() > endDate;
});

quarantineRecordSchema.virtual('remaining_days').get(function () {
  if (this.status !== QuarantineStatus.ACTIVE) return 0;
  const endDate = new Date(this.start_date);
  endDate.setDate(endDate.getDate() + this.expected_duration_days);
  const diff = endDate.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// ── Model ──
export const QuarantineRecord: Model<IQuarantineRecord> =
  mongoose.model<IQuarantineRecord>(
    'QuarantineRecord',
    quarantineRecordSchema,
  );

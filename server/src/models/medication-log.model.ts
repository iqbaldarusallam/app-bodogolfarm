import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  MedicationType,
  DosageUnit,
  MedicationRoute,
  MedicationResponse,
} from '../types/enums';

// ── Interface ──
export interface IMedicationLog extends Document {
  _id: mongoose.Types.ObjectId;
  health_record_id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  medication_type: MedicationType;
  medicine_name: string;
  active_ingredient?: string;
  dosage: number;
  dosage_unit: DosageUnit;
  route: MedicationRoute;
  frequency: string;
  duration_days: number;
  start_date: Date;
  end_date: Date;
  withdrawal_period_days?: number;
  withdrawal_end_date?: Date;
  response?: MedicationResponse;
  administered_by: mongoose.Types.ObjectId;
  batch_number?: string;
  notes?: string;
  created_at: Date;
}

// ── Schema ──
const medicationLogSchema = new Schema<IMedicationLog>(
  {
    health_record_id: {
      type: Schema.Types.ObjectId,
      ref: 'HealthRecord',
      required: [true, 'Catatan kesehatan wajib diisi'],
    },
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    medication_type: {
      type: String,
      required: [true, 'Jenis pengobatan wajib diisi'],
      enum: {
        values: Object.values(MedicationType),
        message: 'Jenis pengobatan tidak valid: {VALUE}',
      },
    },
    medicine_name: {
      type: String,
      required: [true, 'Nama obat wajib diisi'],
      trim: true,
    },
    active_ingredient: {
      type: String,
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
      enum: {
        values: Object.values(DosageUnit),
        message: 'Satuan dosis tidak valid: {VALUE}',
      },
    },
    route: {
      type: String,
      required: [true, 'Rute pemberian wajib diisi'],
      enum: {
        values: Object.values(MedicationRoute),
        message: 'Rute pemberian tidak valid: {VALUE}',
      },
    },
    frequency: {
      type: String,
      required: [true, 'Frekuensi wajib diisi'],
      trim: true,
    },
    duration_days: {
      type: Number,
      required: [true, 'Durasi wajib diisi'],
      min: [1, 'Durasi minimal 1 hari'],
    },
    start_date: {
      type: Date,
      required: [true, 'Tanggal mulai wajib diisi'],
    },
    end_date: {
      type: Date,
      required: [true, 'Tanggal selesai wajib diisi'],
      validate: {
        validator: function (this: IMedicationLog, v: Date) {
          return v >= this.start_date;
        },
        message: 'Tanggal selesai harus setelah tanggal mulai',
      },
    },
    withdrawal_period_days: {
      type: Number,
      min: [0, 'Masa tunggu tidak boleh negatif'],
      validate: {
        validator: function (this: IMedicationLog, v: number | undefined) {
          if (this.medication_type === MedicationType.TREATMENT) {
            return v !== undefined && v >= 0;
          }
          return true;
        },
        message: 'Masa tunggu wajib diisi untuk jenis treatment',
      },
    },
    withdrawal_end_date: {
      type: Date,
    },
    response: {
      type: String,
      enum: {
        values: Object.values(MedicationResponse),
        message: 'Respon pengobatan tidak valid: {VALUE}',
      },
    },
    administered_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Petugas pemberi obat wajib diisi'],
    },
    batch_number: {
      type: String,
      trim: true,
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
medicationLogSchema.index({ livestock_id: 1, start_date: -1 });
medicationLogSchema.index({ livestock_id: 1, withdrawal_end_date: 1 });
medicationLogSchema.index({ health_record_id: 1 });
medicationLogSchema.index({ livestock_id: 1, response: 1 });

// ── Hooks: hitung withdrawal_end_date ──
medicationLogSchema.pre('save', function (next) {
  if (this.withdrawal_period_days && this.start_date) {
    const endDate = new Date(this.start_date);
    endDate.setDate(endDate.getDate() + this.withdrawal_period_days);
    this.withdrawal_end_date = endDate;
  }
  next();
});

// ── Virtuals ──
medicationLogSchema.virtual('is_withdrawal_active').get(function () {
  if (!this.withdrawal_end_date) return false;
  return new Date() < this.withdrawal_end_date;
});

// ── Model ──
export const MedicationLog: Model<IMedicationLog> =
  mongoose.model<IMedicationLog>('MedicationLog', medicationLogSchema);

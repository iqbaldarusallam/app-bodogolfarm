import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ReproductionEventType,
  MatingType,
  PregnancyStatus,
  DeliveryType,
} from '../types/enums';

// ── Interface ──
export interface IReproductionRecord extends Document {
  _id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  event_type: ReproductionEventType;
  event_date: Date;
  estrus_signs?: string[];
  mating_type?: MatingType;
  sire_id?: mongoose.Types.ObjectId;
  straw_code?: string;
  bull_id_straw?: string;
  pregnancy_status?: PregnancyStatus;
  gestation_days_expected?: number;
  expected_birth_date?: Date;
  offspring_count?: number;
  birth_type?: DeliveryType;
  kidding_ease_score?: number;
  offspring_ids?: mongoose.Types.ObjectId[];
  days_open?: number;
  service_count?: number;
  notes?: string;
  recorded_by: mongoose.Types.ObjectId;
  created_at: Date;
}

// ── Schema ──
const reproductionRecordSchema = new Schema<IReproductionRecord>(
  {
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    event_type: {
      type: String,
      required: [true, 'Jenis event wajib diisi'],
      enum: {
        values: Object.values(ReproductionEventType),
        message: 'Jenis event tidak valid: {VALUE}',
      },
    },
    event_date: {
      type: Date,
      required: [true, 'Tanggal event wajib diisi'],
    },
    estrus_signs: {
      type: [String],
    },
    mating_type: {
      type: String,
      enum: {
        values: Object.values(MatingType),
        message: 'Jenis kawin tidak valid: {VALUE}',
      },
      validate: {
        validator: function (this: IReproductionRecord, v: MatingType | undefined) {
          if (this.event_type === ReproductionEventType.MATING) {
            return v !== undefined;
          }
          return true;
        },
        message: 'Jenis kawin wajib diisi untuk event mating',
      },
    },
    sire_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      validate: {
        validator: function (this: IReproductionRecord, v: mongoose.Types.ObjectId | undefined) {
          if (
            this.event_type === ReproductionEventType.MATING &&
            this.mating_type === MatingType.NATURAL
          ) {
            return v !== undefined;
          }
          return true;
        },
        message: 'Pejantan wajib diisi untuk kawin alam',
      },
    },
    straw_code: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: IReproductionRecord, v: string | undefined) {
          if (
            this.event_type === ReproductionEventType.MATING &&
            this.mating_type === MatingType.AI
          ) {
            return v !== undefined && v.length > 0;
          }
          return true;
        },
        message: 'Kode straw wajib diisi untuk inseminasi buatan',
      },
    },
    bull_id_straw: {
      type: String,
      trim: true,
    },
    pregnancy_status: {
      type: String,
      enum: {
        values: Object.values(PregnancyStatus),
        message: 'Status kebuntingan tidak valid: {VALUE}',
      },
    },
    gestation_days_expected: {
      type: Number,
      min: [1, 'Masa gestasi minimal 1 hari'],
    },
    expected_birth_date: {
      type: Date,
    },
    offspring_count: {
      type: Number,
      min: [0, 'Jumlah anak tidak boleh negatif'],
    },
    birth_type: {
      type: String,
      enum: {
        values: Object.values(DeliveryType),
        message: 'Tipe kelahiran tidak valid: {VALUE}',
      },
    },
    kidding_ease_score: {
      type: Number,
      min: [1, 'Skor kemudahan melahirkan minimal 1'],
      max: [4, 'Skor kemudahan melahirkan maksimal 4'],
    },
    offspring_ids: {
      type: [Schema.Types.ObjectId],
      ref: 'Livestock',
    },
    days_open: {
      type: Number,
      min: [0, 'Days open tidak boleh negatif'],
    },
    service_count: {
      type: Number,
      min: [0, 'Jumlah service tidak boleh negatif'],
    },
    notes: {
      type: String,
      trim: true,
    },
    recorded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Petugas pencatat wajib diisi'],
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
reproductionRecordSchema.index({ livestock_id: 1, event_date: -1 });
reproductionRecordSchema.index({
  livestock_id: 1,
  event_type: 1,
  event_date: -1,
});
reproductionRecordSchema.index({ sire_id: 1 });
reproductionRecordSchema.index({ pregnancy_status: 1 });

// ── Hooks: hitung expected_birth_date ──
reproductionRecordSchema.pre('save', function () {
  if (
    this.gestation_days_expected &&
    this.event_date &&
    !this.expected_birth_date
  ) {
    const expected = new Date(this.event_date);
    expected.setDate(expected.getDate() + this.gestation_days_expected);
    this.expected_birth_date = expected;
  }
});

// ── Virtuals ──
reproductionRecordSchema.virtual('is_breeding_event').get(function () {
  return [
    ReproductionEventType.MATING,
    ReproductionEventType.PREGNANCY_CHECK,
  ].includes(this.event_type);
});

// ── Model ──
export const ReproductionRecord: Model<IReproductionRecord> =
  mongoose.model<IReproductionRecord>(
    'ReproductionRecord',
    reproductionRecordSchema,
  );

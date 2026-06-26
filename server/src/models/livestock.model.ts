import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  LivestockSex,
  LivestockStatus,
  LivestockOrigin,
  BirthType,
  Species,
} from '../types/enums';

// ── Interface ──
export interface ILivestock extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  ear_tag: string;
  national_id?: string;
  rfid_tag?: string;
  name?: string;
  species: Species;
  breed: string;
  sex: LivestockSex;
  birth_date: Date;
  birth_type?: BirthType;
  origin: LivestockOrigin;
  purchase_date?: Date;
  purchase_price?: number;
  current_pen_id: mongoose.Types.ObjectId;
  current_status: LivestockStatus;
  dam_id?: mongoose.Types.ObjectId;
  sire_id?: mongoose.Types.ObjectId;
  photo_url?: string;
  notes?: string;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const livestockSchema = new Schema<ILivestock>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    ear_tag: {
      type: String,
      required: [true, 'Ear tag wajib diisi'],
      trim: true,
    },
    national_id: {
      type: String,
      trim: true,
      sparse: true,
    },
    rfid_tag: {
      type: String,
      trim: true,
      sparse: true,
    },
    name: {
      type: String,
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Spesies wajib diisi'],
      enum: {
        values: Object.values(Species),
        message: 'Spesies tidak valid: {VALUE}',
      },
    },
    breed: {
      type: String,
      required: [true, 'Ras/galur wajib diisi'],
      trim: true,
    },
    sex: {
      type: String,
      required: [true, 'Jenis kelamin wajib diisi'],
      enum: {
        values: Object.values(LivestockSex),
        message: 'Jenis kelamin tidak valid: {VALUE}',
      },
    },
    birth_date: {
      type: Date,
      required: [true, 'Tanggal lahir wajib diisi'],
      validate: {
        validator: function (v: Date) {
          return v <= new Date();
        },
        message: 'Tanggal lahir tidak boleh di masa depan',
      },
    },
    birth_type: {
      type: String,
      enum: {
        values: Object.values(BirthType),
        message: 'Tipe kelahiran tidak valid: {VALUE}',
      },
    },
    origin: {
      type: String,
      required: [true, 'Asal ternak wajib diisi'],
      enum: {
        values: Object.values(LivestockOrigin),
        message: 'Asal ternak tidak valid: {VALUE}',
      },
    },
    purchase_date: {
      type: Date,
    },
    purchase_price: {
      type: Number,
      min: [0, 'Harga beli tidak boleh negatif'],
    },
    current_pen_id: {
      type: Schema.Types.ObjectId,
      ref: 'Pen',
      required: [true, 'Kandang aktif wajib diisi'],
    },
    current_status: {
      type: String,
      required: [true, 'Status ternak wajib diisi'],
      enum: {
        values: Object.values(LivestockStatus),
        message: 'Status ternak tidak valid: {VALUE}',
      },
      default: LivestockStatus.ACTIVE,
    },
    dam_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      default: null,
    },
    sire_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      default: null,
    },
    photo_url: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pencatat wajib diisi'],
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
livestockSchema.index({ farm_id: 1, ear_tag: 1 }, { unique: true });
livestockSchema.index({ farm_id: 1, national_id: 1 }, { unique: true, sparse: true });
livestockSchema.index({ farm_id: 1, rfid_tag: 1 }, { unique: true, sparse: true });
livestockSchema.index({ farm_id: 1, current_status: 1 });
livestockSchema.index({ current_pen_id: 1, current_status: 1 });
livestockSchema.index({ farm_id: 1, species: 1, breed: 1 });
livestockSchema.index({ farm_id: 1, updated_at: -1 });

// ── Virtuals ──
livestockSchema.virtual('age').get(function () {
  if (!this.birth_date) return null;
  const now = new Date();
  const diff = now.getTime() - this.birth_date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return { days, months, years };
});

// ── Model ──
export const Livestock: Model<ILivestock> = mongoose.model<ILivestock>(
  'Livestock',
  livestockSchema,
);

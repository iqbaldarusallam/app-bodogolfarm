import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IDiseaseCatalog extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  category: string;
  common_symptoms: string[];
  severity_default: 'mild' | 'moderate' | 'severe';
  is_contagious: boolean;
  quarantine_recommended: boolean;
  description: string;
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const diseaseCatalogSchema = new Schema<IDiseaseCatalog>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    code: {
      type: String,
      required: [true, 'Kode penyakit wajib diisi'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Nama penyakit wajib diisi'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Kategori penyakit wajib diisi'],
      trim: true,
    },
    common_symptoms: [{
      type: String,
      trim: true,
    }],
    severity_default: {
      type: String,
      enum: {
        values: ['mild', 'moderate', 'severe'],
        message: 'Tingkat keparahan tidak valid: {VALUE}',
      },
      default: 'moderate',
    },
    is_contagious: {
      type: Boolean,
      default: false,
    },
    quarantine_recommended: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pembuat wajib diisi'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

// ── Indexes ──
diseaseCatalogSchema.index({ farm_id: 1, code: 1 }, { unique: true });
diseaseCatalogSchema.index({ farm_id: 1, name: 1 });
diseaseCatalogSchema.index({ farm_id: 1, is_active: 1 });

// ── Model ──
export const DiseaseCatalog: Model<IDiseaseCatalog> = mongoose.model<IDiseaseCatalog>(
  'DiseaseCatalog',
  diseaseCatalogSchema,
);

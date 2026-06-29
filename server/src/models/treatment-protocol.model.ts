import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface ITreatmentProtocol extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  disease_catalog_id: mongoose.Types.ObjectId;
  protocol_name: string;
  severity_level: 'mild' | 'moderate' | 'severe';
  initial_action: string;
  recommended_medicines: string[];
  recommended_dosage_notes: string;
  recommended_duration_days: number;
  quarantine_required: boolean;
  cage_sanitation_action: string;
  vet_escalation_criteria: string;
  follow_up_after_days: number;
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const treatmentProtocolSchema = new Schema<ITreatmentProtocol>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    disease_catalog_id: {
      type: Schema.Types.ObjectId,
      ref: 'DiseaseCatalog',
      required: [true, 'Penyakit wajib diisi'],
    },
    protocol_name: {
      type: String,
      required: [true, 'Nama protokol wajib diisi'],
      trim: true,
    },
    severity_level: {
      type: String,
      enum: {
        values: ['mild', 'moderate', 'severe'],
        message: 'Tingkat keparahan tidak valid: {VALUE}',
      },
      default: 'moderate',
    },
    initial_action: {
      type: String,
      required: [true, 'Tindakan awal wajib diisi'],
      trim: true,
    },
    recommended_medicines: [{
      type: String,
      trim: true,
    }],
    recommended_dosage_notes: {
      type: String,
      trim: true,
      default: '',
    },
    recommended_duration_days: {
      type: Number,
      min: [1, 'Durasi minimal 1 hari'],
      default: 7,
    },
    quarantine_required: {
      type: Boolean,
      default: false,
    },
    cage_sanitation_action: {
      type: String,
      trim: true,
      default: '',
    },
    vet_escalation_criteria: {
      type: String,
      trim: true,
      default: '',
    },
    follow_up_after_days: {
      type: Number,
      min: [0, 'Follow up tidak boleh negatif'],
      default: 3,
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
treatmentProtocolSchema.index({ farm_id: 1, disease_catalog_id: 1 });
treatmentProtocolSchema.index({ farm_id: 1, is_active: 1 });

// ── Model ──
export const TreatmentProtocol: Model<ITreatmentProtocol> = mongoose.model<ITreatmentProtocol>(
  'TreatmentProtocol',
  treatmentProtocolSchema,
);

import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IDeathLossRecord extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  livestock_id: mongoose.Types.ObjectId;
  death_record_id?: mongoose.Types.ObjectId;
  snapshot: {
    ear_tag: string;
    name?: string;
    species: string;
    breed: string;
    sex: string;
    age_at_death_days: number;
    last_weight_kg: number;
    last_weight_date: Date;
    death_date: Date;
    death_cause: string;
    cage_at_death?: string;
  };
  market_value_loss: {
    price_per_kg_used: number;
    estimated_market_value: number;
    is_market_price_available: boolean;
  };
  investment_cost: {
    purchase_price: number;
    total_feed_cost: number;
    total_medicine_cost: number;
    total_vaccine_cost: number;
    total_investment: number;
  };
  total_loss: number;
  is_complete_calculation: boolean;
  calculation_notes: string;
  calculated_at: Date;
  calculated_by: mongoose.Types.ObjectId;
  created_at: Date;
}

// ── Schema ──
const deathLossRecordSchema = new Schema<IDeathLossRecord>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    livestock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Livestock',
      required: [true, 'Ternak wajib diisi'],
    },
    death_record_id: {
      type: Schema.Types.ObjectId,
      ref: 'StatusHistory',
    },
    snapshot: {
      ear_tag: { type: String, required: true },
      name: { type: String },
      species: { type: String, required: true },
      breed: { type: String, required: true },
      sex: { type: String, required: true },
      age_at_death_days: { type: Number, required: true },
      last_weight_kg: { type: Number, required: true },
      last_weight_date: { type: Date, required: true },
      death_date: { type: Date, required: true },
      death_cause: { type: String, required: true },
      cage_at_death: { type: String },
    },
    market_value_loss: {
      price_per_kg_used: { type: Number, default: 0 },
      estimated_market_value: { type: Number, default: 0 },
      is_market_price_available: { type: Boolean, default: false },
    },
    investment_cost: {
      purchase_price: { type: Number, default: 0 },
      total_feed_cost: { type: Number, default: 0 },
      total_medicine_cost: { type: Number, default: 0 },
      total_vaccine_cost: { type: Number, default: 0 },
      total_investment: { type: Number, default: 0 },
    },
    total_loss: { type: Number, default: 0 },
    is_complete_calculation: { type: Boolean, default: false },
    calculation_notes: { type: String, default: '' },
    calculated_at: { type: Date, required: true },
    calculated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  },
);

// ── Indexes ──
deathLossRecordSchema.index({ farm_id: 1, created_at: -1 });
deathLossRecordSchema.index({ livestock_id: 1 }, { unique: true });
deathLossRecordSchema.index({ 'snapshot.death_date': -1 });

// ── Model ──
export const DeathLossRecord: Model<IDeathLossRecord> = mongoose.model<IDeathLossRecord>(
  'DeathLossRecord',
  deathLossRecordSchema,
);

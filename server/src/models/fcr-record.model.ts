import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IFCRRecord extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  cage_id: mongoose.Types.ObjectId;
  period_start: Date;
  period_end: Date;
  period_days: number;
  feed_data: {
    total_feed_kg: number;
    feed_cost_total: number;
    feed_record_count: number;
  };
  weight_data: {
    livestock_count_average: number;
    total_weight_gain_kg: number;
    average_weight_gain_kg_per_head: number;
    average_daily_gain_gram_per_head: number;
  };
  fcr: {
    value: number;
    category: 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient_data';
    is_alert_triggered: boolean;
  };
  feed_items_used: string[];
  is_data_sufficient: boolean;
  insufficient_data_notes: string;
  calculated_at: Date;
  calculated_by: mongoose.Types.ObjectId;
  created_at: Date;
}

// ── Schema ──
const fcrRecordSchema = new Schema<IFCRRecord>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    cage_id: {
      type: Schema.Types.ObjectId,
      ref: 'Pen',
      required: true,
    },
    period_start: {
      type: Date,
      required: true,
    },
    period_end: {
      type: Date,
      required: true,
    },
    period_days: {
      type: Number,
      required: true,
      min: [14, 'Minimal 14 hari'],
    },
    feed_data: {
      total_feed_kg: { type: Number, default: 0 },
      feed_cost_total: { type: Number, default: 0 },
      feed_record_count: { type: Number, default: 0 },
    },
    weight_data: {
      livestock_count_average: { type: Number, default: 0 },
      total_weight_gain_kg: { type: Number, default: 0 },
      average_weight_gain_kg_per_head: { type: Number, default: 0 },
      average_daily_gain_gram_per_head: { type: Number, default: 0 },
    },
    fcr: {
      value: { type: Number, default: 0 },
      category: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'insufficient_data'],
        default: 'insufficient_data',
      },
      is_alert_triggered: { type: Boolean, default: false },
    },
    feed_items_used: [{ type: String }],
    is_data_sufficient: { type: Boolean, default: false },
    insufficient_data_notes: { type: String, default: '' },
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
fcrRecordSchema.index({ farm_id: 1, cage_id: 1, period_start: -1 });
fcrRecordSchema.index({ 'fcr.is_alert_triggered': 1 });

// ── Model ──
export const FCRRecord: Model<IFCRRecord> = mongoose.model<IFCRRecord>(
  'FCRRecord',
  fcrRecordSchema,
);

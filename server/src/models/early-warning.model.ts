import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IEarlyWarningRule extends Document {
  _id: mongoose.Types.ObjectId;
  rule_code: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  trigger_entity: 'livestock' | 'cage' | 'farm';
  parameters: Record<string, number>;
  recommended_action: string;
  is_active: boolean;
  escalation_hours: number;
  created_at: Date;
  updated_at: Date;
}

export interface IEarlyWarningAlert extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  rule_id: mongoose.Types.ObjectId;
  rule_code: string;
  priority: 'high' | 'medium' | 'low';
  trigger_entity: 'livestock' | 'cage' | 'farm';
  trigger_livestock_id?: mongoose.Types.ObjectId;
  trigger_cage_id?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  recommended_action: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'auto_resolved' | 'escalated';
  acknowledged_at?: Date;
  acknowledged_by?: mongoose.Types.ObjectId;
  resolved_at?: Date;
  resolved_by?: mongoose.Types.ObjectId;
  resolution_notes?: string;
  is_escalated: boolean;
  escalated_at?: Date;
  triggered_at: Date;
  created_at: Date;
  updated_at: Date;
}

// ── Schemas ──
const earlyWarningRuleSchema = new Schema<IEarlyWarningRule>({
  rule_code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
  trigger_entity: { type: String, enum: ['livestock', 'cage', 'farm'], required: true },
  parameters: { type: Schema.Types.Mixed, default: {} },
  recommended_action: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  escalation_hours: { type: Number, default: 48 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
});

const earlyWarningAlertSchema = new Schema<IEarlyWarningAlert>({
  farm_id: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  rule_id: { type: Schema.Types.ObjectId, ref: 'EarlyWarningRule', required: true },
  rule_code: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
  trigger_entity: { type: String, enum: ['livestock', 'cage', 'farm'], required: true },
  trigger_livestock_id: { type: Schema.Types.ObjectId, ref: 'Livestock' },
  trigger_cage_id: { type: Schema.Types.ObjectId, ref: 'Pen' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  recommended_action: { type: String },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'auto_resolved', 'escalated'],
    default: 'active',
  },
  acknowledged_at: { type: Date },
  acknowledged_by: { type: Schema.Types.ObjectId, ref: 'User' },
  resolved_at: { type: Date },
  resolved_by: { type: Schema.Types.ObjectId, ref: 'User' },
  resolution_notes: { type: String },
  is_escalated: { type: Boolean, default: false },
  escalated_at: { type: Date },
  triggered_at: { type: Date, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
});

// ── Indexes ──
earlyWarningAlertSchema.index({ farm_id: 1, status: 1, priority: 1 });
earlyWarningAlertSchema.index({ farm_id: 1, triggered_at: -1 });
earlyWarningAlertSchema.index({ rule_code: 1, triggered_at: -1 });

// ── Models ──
export const EarlyWarningRule: Model<IEarlyWarningRule> = mongoose.model<IEarlyWarningRule>(
  'EarlyWarningRule',
  earlyWarningRuleSchema,
);

export const EarlyWarningAlert: Model<IEarlyWarningAlert> = mongoose.model<IEarlyWarningAlert>(
  'EarlyWarningAlert',
  earlyWarningAlertSchema,
);

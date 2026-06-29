import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IChecklistItem {
  item_code: string;
  title: string;
  module_target: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'skipped' | 'overdue';
  completed_by?: mongoose.Types.ObjectId;
  completed_at?: Date;
  skipped_reason?: string;
  related_record_id?: mongoose.Types.ObjectId;
}

export interface IFarmOperationChecklist extends Document {
  _id: mongoose.Types.ObjectId;
  farm_id: mongoose.Types.ObjectId;
  checklist_type: 'daily' | 'weekly' | 'monthly';
  checklist_date: Date;
  period_start?: Date;
  period_end?: Date;
  items: IChecklistItem[];
  status: 'active' | 'completed' | 'partially_completed';
  completed_by?: mongoose.Types.ObjectId;
  completed_at?: Date;
  reviewed_by?: mongoose.Types.ObjectId;
  reviewed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const checklistItemSchema = new Schema<IChecklistItem>({
  item_code: { type: String, required: true },
  title: { type: String, required: true },
  module_target: { type: String, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'skipped', 'overdue'],
    default: 'pending',
  },
  completed_by: { type: Schema.Types.ObjectId, ref: 'User' },
  completed_at: { type: Date },
  skipped_reason: { type: String },
  related_record_id: { type: Schema.Types.ObjectId },
});

const farmOperationChecklistSchema = new Schema<IFarmOperationChecklist>(
  {
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    checklist_type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    checklist_date: {
      type: Date,
      required: true,
    },
    period_start: { type: Date },
    period_end: { type: Date },
    items: [checklistItemSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'partially_completed'],
      default: 'active',
    },
    completed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    completed_at: { type: Date },
    reviewed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewed_at: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

// ── Indexes ──
farmOperationChecklistSchema.index({ farm_id: 1, checklist_date: -1 });
farmOperationChecklistSchema.index({ farm_id: 1, checklist_type: 1, status: 1 });

// ── Model ──
export const FarmOperationChecklist: Model<IFarmOperationChecklist> = mongoose.model<IFarmOperationChecklist>(
  'FarmOperationChecklist',
  farmOperationChecklistSchema,
);

import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Interface ──
export interface IFarm extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  address: string;
  owner: string;
  created_at: Date;
  updated_at: Date;
}

// ── Schema ──
const farmSchema = new Schema<IFarm>(
  {
    name: {
      type: String,
      required: [true, 'Nama farm wajib diisi'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Alamat farm wajib diisi'],
      trim: true,
    },
    owner: {
      type: String,
      required: [true, 'Pemilik farm wajib diisi'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

// ── Model ──
export const Farm: Model<IFarm> = mongoose.model<IFarm>('Farm', farmSchema);

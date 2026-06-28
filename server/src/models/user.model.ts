import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/enums';

// ── Interface ──
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  farm_id: mongoose.Types.ObjectId;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  // methods
  comparePassword(candidate: string): Promise<boolean>;
}

// ── Schema ──
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
      minlength: [2, 'Nama minimal 2 karakter'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: [8, 'Password minimal 8 karakter'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role wajib diisi'],
      enum: {
        values: Object.values(UserRole),
        message: 'Role tidak valid: {VALUE}',
      },
    },
    farm_id: {
      type: Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm wajib diisi'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

// ── Indexes ──
userSchema.index({ farm_id: 1, role: 1 });
userSchema.index({ farm_id: 1, is_active: 1 });

// ── Hooks ──
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Methods ──
userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ── Model ──
export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

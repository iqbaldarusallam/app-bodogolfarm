import { User } from '../../models/user.model';
import { AppError } from '../../middlewares';
import { CreateUserInput, UpdateUserInput } from './users.validator';

export async function getAll(farmId: string) {
  return User.find({ farm_id: farmId }).sort({ created_at: -1 });
}

export async function getById(id: string) {
  const user = await User.findById(id);
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return user;
}

export async function create(input: CreateUserInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError('Email sudah terdaftar', 409);
  return User.create(input);
}

export async function update(id: string, input: UpdateUserInput) {
  const user = await User.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return user;
}

export async function remove(id: string) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return { message: 'User berhasil dihapus' };
}

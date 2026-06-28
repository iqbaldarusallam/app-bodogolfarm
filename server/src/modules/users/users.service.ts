import { User } from '../../models/user.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';
import { CreateUserInput, UpdateUserInput } from './users.validator';

export async function getAll(farmId: string) {
  return User.find({ farm_id: farmId }).sort({ created_at: -1 });
}

export async function getById(id: string, farmId: string) {
  const user = await User.findById(id);
  assertBelongsToFarm(user, farmId, 'User');
  return user;
}

export async function create(input: CreateUserInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError('Email sudah terdaftar', 409);
  return User.create(input);
}

export async function update(id: string, input: UpdateUserInput, farmId: string) {
  const existing = await User.findById(id);
  assertBelongsToFarm(existing, farmId, 'User');
  const user = await User.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return user;
}

export async function remove(id: string, farmId: string) {
  const user = await User.findById(id);
  assertBelongsToFarm(user, farmId, 'User');
  await User.findByIdAndDelete(id);
  return { message: 'User berhasil dihapus' };
}

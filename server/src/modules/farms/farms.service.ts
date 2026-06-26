import { Farm } from '../../models/farm.model';
import { AppError } from '../../middlewares';
import { CreateFarmInput, UpdateFarmInput } from './farms.validator';

export async function getAll() {
  return Farm.find().sort({ created_at: -1 });
}

export async function getById(id: string) {
  const farm = await Farm.findById(id);
  if (!farm) throw new AppError('Farm tidak ditemukan', 404);
  return farm;
}

export async function create(input: CreateFarmInput) {
  return Farm.create(input);
}

export async function update(id: string, input: UpdateFarmInput) {
  const farm = await Farm.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!farm) throw new AppError('Farm tidak ditemukan', 404);
  return farm;
}

export async function remove(id: string) {
  const farm = await Farm.findByIdAndDelete(id);
  if (!farm) throw new AppError('Farm tidak ditemukan', 404);
  return { message: 'Farm berhasil dihapus' };
}

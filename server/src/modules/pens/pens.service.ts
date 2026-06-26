import { Pen } from '../../models/pen.model';
import { AppError } from '../../middlewares';
import { CreatePenInput, UpdatePenInput } from './pens.validator';

export async function getAll(farmId: string) {
  return Pen.find({ farm_id: farmId }).sort({ pen_code: 1 });
}

export async function getById(id: string) {
  const pen = await Pen.findById(id);
  if (!pen) throw new AppError('Kandang tidak ditemukan', 404);
  return pen;
}

export async function create(input: CreatePenInput) {
  const existing = await Pen.findOne({
    farm_id: input.farm_id,
    pen_code: input.pen_code,
  });
  if (existing) throw new AppError('Kode kandang sudah ada di farm ini', 409);
  return Pen.create(input);
}

export async function update(id: string, input: UpdatePenInput) {
  const pen = await Pen.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!pen) throw new AppError('Kandang tidak ditemukan', 404);
  return pen;
}

export async function remove(id: string) {
  const pen = await Pen.findByIdAndDelete(id);
  if (!pen) throw new AppError('Kandang tidak ditemukan', 404);
  return { message: 'Kandang berhasil dihapus' };
}

export async function getByType(farmId: string, penType: string) {
  return Pen.find({ farm_id: farmId, pen_type: penType }).sort({ pen_code: 1 });
}

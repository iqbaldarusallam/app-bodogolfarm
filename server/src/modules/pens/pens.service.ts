import { Pen } from '../../models/pen.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';
import { CreatePenInput, UpdatePenInput } from './pens.validator';

export async function getAll(farmId: string) {
  return Pen.find({ farm_id: farmId }).sort({ pen_code: 1 });
}

export async function getById(id: string, farmId: string) {
  const pen = await Pen.findById(id);
  assertBelongsToFarm(pen, farmId, 'Kandang');
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

export async function update(id: string, input: UpdatePenInput, farmId: string) {
  const existing = await Pen.findById(id);
  assertBelongsToFarm(existing, farmId, 'Kandang');
  const pen = await Pen.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return pen;
}

export async function remove(id: string, farmId: string) {
  const pen = await Pen.findById(id);
  assertBelongsToFarm(pen, farmId, 'Kandang');
  await Pen.findByIdAndDelete(id);
  return { message: 'Kandang berhasil dihapus' };
}

export async function getByType(farmId: string, penType: string) {
  return Pen.find({ farm_id: farmId, pen_type: penType }).sort({ pen_code: 1 });
}

// ── Pen Occupancy Management ──

export async function incrementOccupancy(penId: string): Promise<void> {
  const pen = await Pen.findById(penId);
  if (!pen) throw new AppError('Kandang tidak ditemukan', 404);
  if (pen.current_count >= pen.capacity) {
    throw new AppError(`Kandang ${pen.pen_code} sudah penuh (${pen.current_count}/${pen.capacity})`, 400);
  }
  pen.current_count += 1;
  await pen.save();
}

export async function decrementOccupancy(penId: string): Promise<void> {
  const pen = await Pen.findById(penId);
  if (!pen) return;
  pen.current_count = Math.max(0, pen.current_count - 1);
  await pen.save();
}

export async function assertHasCapacity(penId: string, farmId?: string): Promise<void> {
  const pen = await Pen.findById(penId);
  if (!pen) throw new AppError('Kandang tidak ditemukan', 404);
  if (farmId) assertBelongsToFarm(pen, farmId, 'Kandang');
  if (!pen.is_active) throw new AppError('Kandang tidak aktif', 400);
  if (pen.current_count >= pen.capacity) {
    throw new AppError(`Kandang ${pen.pen_code} sudah penuh (${pen.current_count}/${pen.capacity})`, 400);
  }
}

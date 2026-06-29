import { DiseaseCatalog } from '../../models/disease-catalog.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';
import {
  CreateDiseaseCatalogInput,
  UpdateDiseaseCatalogInput,
} from './disease-catalog.validator';

export async function getAll(farmId: string, activeOnly = true) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (activeOnly) filter.is_active = true;
  return DiseaseCatalog.find(filter).sort({ name: 1 });
}

export async function getById(id: string, farmId: string) {
  const disease = await DiseaseCatalog.findById(id);
  assertBelongsToFarm(disease, farmId, 'Penyakit');
  return disease;
}

export async function create(input: CreateDiseaseCatalogInput, userId: string, farmId: string) {
  // Check for duplicate code within farm
  const existing = await DiseaseCatalog.findOne({
    farm_id: farmId,
    code: input.code,
  });
  if (existing) throw new AppError('Kode penyakit sudah ada di farm ini', 409);

  return DiseaseCatalog.create({
    ...input,
    farm_id: farmId,
    created_by: userId,
  });
}

export async function update(id: string, input: UpdateDiseaseCatalogInput, farmId: string) {
  const existing = await DiseaseCatalog.findById(id);
  assertBelongsToFarm(existing, farmId, 'Penyakit');

  // If code is being changed, check for duplicate
  if (input.code && input.code !== existing.code) {
    const duplicate = await DiseaseCatalog.findOne({
      farm_id: farmId,
      code: input.code,
    });
    if (duplicate) throw new AppError('Kode penyakit sudah ada di farm ini', 409);
  }

  return DiseaseCatalog.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
}

export async function remove(id: string, farmId: string) {
  const disease = await DiseaseCatalog.findById(id);
  assertBelongsToFarm(disease, farmId, 'Penyakit');
  await DiseaseCatalog.findByIdAndDelete(id);
  return { message: 'Penyakit berhasil dihapus' };
}

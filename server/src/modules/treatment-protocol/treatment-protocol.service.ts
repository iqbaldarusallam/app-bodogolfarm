import { TreatmentProtocol } from '../../models/treatment-protocol.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';
import {
  CreateTreatmentProtocolInput,
  UpdateTreatmentProtocolInput,
} from './treatment-protocol.validator';

export async function getAll(farmId: string, activeOnly = true) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (activeOnly) filter.is_active = true;
  return TreatmentProtocol.find(filter)
    .populate('disease_catalog_id', 'code name category')
    .sort({ protocol_name: 1 });
}

export async function getByDisease(diseaseCatalogId: string, farmId: string) {
  return TreatmentProtocol.find({
    farm_id: farmId,
    disease_catalog_id: diseaseCatalogId,
    is_active: true,
  }).populate('disease_catalog_id', 'code name category');
}

export async function getById(id: string, farmId: string) {
  const protocol = await TreatmentProtocol.findById(id)
    .populate('disease_catalog_id', 'code name category common_symptoms is_contagious quarantine_recommended');
  assertBelongsToFarm(protocol, farmId, 'Protokol');
  return protocol;
}

export async function create(input: CreateTreatmentProtocolInput, userId: string, farmId: string) {
  return TreatmentProtocol.create({
    ...input,
    farm_id: farmId,
    created_by: userId,
  });
}

export async function update(id: string, input: UpdateTreatmentProtocolInput, userId: string, farmId: string) {
  const existing = await TreatmentProtocol.findById(id);
  assertBelongsToFarm(existing, farmId, 'Protokol');

  return TreatmentProtocol.findByIdAndUpdate(
    id,
    { ...input, updated_by: userId },
    { new: true, runValidators: true },
  );
}

export async function remove(id: string, farmId: string) {
  const protocol = await TreatmentProtocol.findById(id);
  assertBelongsToFarm(protocol, farmId, 'Protokol');
  await TreatmentProtocol.findByIdAndDelete(id);
  return { message: 'Protokol berhasil dihapus' };
}

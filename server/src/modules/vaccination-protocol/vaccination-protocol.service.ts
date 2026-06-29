import { VaccinationProtocol } from '../../models/vaccination-protocol.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';

export async function getAll(farmId: string, activeOnly = true) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (activeOnly) filter.is_active = true;
  return VaccinationProtocol.find(filter).sort({ priority: 1, name: 1 });
}

export async function getById(id: string, farmId: string) {
  const protocol = await VaccinationProtocol.findById(id);
  assertBelongsToFarm(protocol, farmId, 'Protokol Vaksinasi');
  return protocol;
}

export async function create(input: any, userId: string, farmId: string) {
  return VaccinationProtocol.create({
    ...input,
    farm_id: farmId,
    created_by: userId,
  });
}

export async function update(id: string, input: any, userId: string, farmId: string) {
  const existing = await VaccinationProtocol.findById(id);
  assertBelongsToFarm(existing, farmId, 'Protokol Vaksinasi');
  return VaccinationProtocol.findByIdAndUpdate(
    id,
    { ...input, updated_by: userId },
    { new: true, runValidators: true },
  );
}

export async function remove(id: string, farmId: string) {
  const protocol = await VaccinationProtocol.findById(id);
  assertBelongsToFarm(protocol, farmId, 'Protokol Vaksinasi');
  await VaccinationProtocol.findByIdAndDelete(id);
  return { message: 'Protokol vaksinasi berhasil dihapus' };
}

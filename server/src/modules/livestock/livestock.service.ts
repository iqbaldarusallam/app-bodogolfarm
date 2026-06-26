import { Livestock } from '../../models/livestock.model';
import { AppError } from '../../middlewares';
import { StatusHistory } from '../../models/status-history.model';
import {
  CreateLivestockInput,
  UpdateLivestockInput,
  LivestockQueryInput,
} from './livestock.validator';
import { LivestockStatus } from '../../types/enums';

export async function getAll(farmId: string, query: LivestockQueryInput) {
  const filter: Record<string, unknown> = { farm_id: farmId };

  if (query.status) filter.current_status = query.status;
  if (query.species) filter.species = query.species;
  if (query.pen_id) filter.current_pen_id = query.pen_id;
  if (query.search) {
    filter.$or = [
      { ear_tag: { $regex: query.search, $options: 'i' } },
      { name: { $regex: query.search, $options: 'i' } },
      { national_id: { $regex: query.search, $options: 'i' } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = {
    [query.sort]: query.order === 'asc' ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    Livestock.find(filter).sort(sort).skip(skip).limit(query.limit),
    Livestock.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getById(id: string) {
  const livestock = await Livestock.findById(id)
    .populate('current_pen_id', 'pen_code pen_type')
    .populate('dam_id', 'ear_tag name')
    .populate('sire_id', 'ear_tag name');
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);
  return livestock;
}

export async function create(input: CreateLivestockInput, userId: string) {
  const existing = await Livestock.findOne({
    farm_id: input.farm_id,
    ear_tag: input.ear_tag,
  });
  if (existing) throw new AppError('Ear tag sudah ada di farm ini', 409);

  return Livestock.create({ ...input, created_by: userId });
}

export async function update(id: string, input: UpdateLivestockInput) {
  const livestock = await Livestock.findById(id);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);

  // Jika status berubah, catat di status_history
  if (input.current_status && input.current_status !== livestock.current_status) {
    await StatusHistory.create({
      livestock_id: id,
      status_from: livestock.current_status,
      status_to: input.current_status,
      changed_date: new Date(),
      reason: `Status diubah dari ${livestock.current_status} ke ${input.current_status}`,
      changed_by: livestock.created_by,
    });
  }

  const updated = await Livestock.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });

  return updated;
}

export async function remove(id: string) {
  const livestock = await Livestock.findByIdAndDelete(id);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);
  return { message: 'Ternak berhasil dihapus' };
}

export async function getTimeline(id: string) {
  const livestock = await Livestock.findById(id);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);

  // Timeline akan diambil dari masing-masing record collection
  // Implementasi detail ada di dashboard service
  return { livestock_id: id };
}

export async function getStats(farmId: string) {
  const [total, active, sick, quarantine, sold, dead] = await Promise.all([
    Livestock.countDocuments({ farm_id: farmId }),
    Livestock.countDocuments({ farm_id: farmId, current_status: LivestockStatus.ACTIVE }),
    Livestock.countDocuments({ farm_id: farmId, current_status: LivestockStatus.SICK }),
    Livestock.countDocuments({ farm_id: farmId, current_status: LivestockStatus.QUARANTINE }),
    Livestock.countDocuments({ farm_id: farmId, current_status: LivestockStatus.SOLD }),
    Livestock.countDocuments({ farm_id: farmId, current_status: LivestockStatus.DEAD }),
  ]);

  return { total, active, sick, quarantine, sold, dead };
}

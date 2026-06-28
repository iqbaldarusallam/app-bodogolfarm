import { Livestock } from '../../models/livestock.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';
import { StatusHistory } from '../../models/status-history.model';
import { incrementOccupancy, decrementOccupancy } from '../pens/pens.service';
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

export async function getById(id: string, farmId: string) {
  const livestock = await Livestock.findById(id)
    .populate('current_pen_id', 'pen_code pen_type')
    .populate('dam_id', 'ear_tag name')
    .populate('sire_id', 'ear_tag name');
  assertBelongsToFarm(livestock, farmId, 'Ternak');
  return livestock;
}

export async function create(input: CreateLivestockInput, userId: string) {
  const existing = await Livestock.findOne({
    farm_id: input.farm_id,
    ear_tag: input.ear_tag,
  });
  if (existing) throw new AppError('Ear tag sudah ada di farm ini', 409);

  const livestock = await Livestock.create({ ...input, created_by: userId });
  await incrementOccupancy(input.current_pen_id as string);
  return livestock;
}

export async function update(id: string, input: UpdateLivestockInput, farmId: string) {
  const livestock = await Livestock.findById(id);
  assertBelongsToFarm(livestock, farmId, 'Ternak');

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

export async function remove(id: string, farmId: string) {
  const livestock = await Livestock.findById(id);
  assertBelongsToFarm(livestock, farmId, 'Ternak');
  await Livestock.findByIdAndDelete(id);
  return { message: 'Ternak berhasil dihapus' };
}

export async function getTimeline(id: string, farmId: string) {
  const livestock = await Livestock.findById(id);
  assertBelongsToFarm(livestock, farmId, 'Ternak');

  // Lazy-import all record models to avoid circular deps
  const { GrowthRecord } = await import('../../models/growth-record.model');
  const { FeedingLog } = await import('../../models/feeding-log.model');
  const { HealthRecord } = await import('../../models/health-record.model');
  const { MedicationLog } = await import('../../models/medication-log.model');
  const { VaccinationRecord } = await import('../../models/vaccination-record.model');
  const { QuarantineRecord } = await import('../../models/quarantine-record.model');
  const { ReproductionRecord } = await import('../../models/reproduction-record.model');

  // Fetch all records in parallel
  const [growth, feeding, health, medication, vaccination, quarantine, reproduction, statusHistory] =
    await Promise.all([
      GrowthRecord.find({ livestock_id: id }).sort({ record_date: -1 }).limit(50),
      FeedingLog.find({ livestock_id: id }).sort({ feed_date: -1 }).limit(50),
      HealthRecord.find({ livestock_id: id }).sort({ record_date: -1 }).limit(50),
      MedicationLog.find({ livestock_id: id }).sort({ start_date: -1 }).limit(50),
      VaccinationRecord.find({ livestock_id: id }).sort({ vaccination_date: -1 }).limit(50),
      QuarantineRecord.find({ livestock_id: id }).sort({ start_date: -1 }).limit(50),
      ReproductionRecord.find({ livestock_id: id }).sort({ event_date: -1 }).limit(50),
      StatusHistory.find({ livestock_id: id }).sort({ changed_date: -1 }).limit(50),
    ]);

  // Map each record to a normalized timeline item
  const timeline: Array<{
    _id: string;
    type: string;
    date: string;
    title: string;
    summary: string;
    icon: string;
    highlight?: string;
  }> = [];

  for (const r of growth) {
    const adg = r.adg_calculated;
    const adgText = adg != null ? ` · ADG: ${adg >= 0 ? '+' : ''}${Math.round(adg * 1000)}g/hari` : '';
    timeline.push({
      _id: r._id.toString(),
      type: 'growth',
      date: r.record_date.toISOString(),
      title: 'Penimbangan',
      summary: `Berat: ${r.weight_kg}kg${adgText}${r.bcs ? ` · BCS: ${r.bcs}/5` : ''}`,
      icon: 'chart-line',
      highlight: adg != null && adg < 0 ? 'ADG NEGATIF' : undefined,
    });
  }

  for (const r of feeding) {
    const feedName = (r as any).feed_master_id?.feed_name ?? 'Pakan';
    timeline.push({
      _id: r._id.toString(),
      type: 'feeding',
      date: r.feed_date.toISOString(),
      title: 'Pakan',
      summary: `${feedName} — ${r.amount_given_kg}kg${r.feeding_time ? ` (${r.feeding_time})` : ''}`,
      icon: 'food',
    });
  }

  for (const r of health) {
    const temp = r.body_temp_celsius;
    let highlight: string | undefined;
    if (temp != null) {
      if (temp > 40) highlight = 'DEMAM';
      else if (temp < 38) highlight = 'HIPOTERMIA';
    }
    timeline.push({
      _id: r._id.toString(),
      type: 'health',
      date: r.record_date.toISOString(),
      title: r.diagnosis ? `Sakit — ${r.diagnosis}` : 'Pemeriksaan Kesehatan',
      summary: [
        temp ? `Suhu: ${temp}°C` : '',
        r.chief_complaint ?? '',
      ].filter(Boolean).join(' · '),
      icon: 'medical-bag',
      highlight,
    });
  }

  for (const r of medication) {
    const isActive = r.withdrawal_end_date && new Date(r.withdrawal_end_date) > new Date();
    timeline.push({
      _id: r._id.toString(),
      type: 'medication',
      date: r.start_date.toISOString(),
      title: `Obat — ${r.medicine_name}`,
      summary: `${r.dosage}${r.dosage_unit} ${r.route}${r.withdrawal_period_days ? ` · Withdrawal: ${r.withdrawal_period_days} hari` : ''}`,
      icon: 'pill',
      highlight: isActive ? 'DALAM MASA HENTI' : undefined,
    });
  }

  for (const r of vaccination) {
    timeline.push({
      _id: r._id.toString(),
      type: 'vaccination',
      date: r.vaccination_date.toISOString(),
      title: `Vaksinasi — ${r.vaccine_name}`,
      summary: `${r.disease_target}${r.dosage ? ` · ${r.dosage}${r.dosage_unit}` : ''}`,
      icon: 'needle',
    });
  }

  for (const r of quarantine) {
    const isActive = r.status === 'active';
    const isCleared = r.status === 'cleared';
    timeline.push({
      _id: r._id.toString(),
      type: r.clearance_test_done && isCleared ? 'clearance' : 'quarantine',
      date: (r.clearance_date ?? r.start_date).toISOString(),
      title: isCleared
        ? `Clearance ${r.clearance_test_result === 'negative' ? 'Negatif' : 'Positif'}`
        : `Karantina — ${r.disease_suspected}`,
      summary: isCleared
        ? 'Karantina selesai'
        : `Kandang karantina · Hari ke-${Math.ceil((Date.now() - r.start_date.getTime()) / 86400000)}`,
      icon: isCleared ? 'check-circle' : 'shield-alert',
      highlight: isActive ? 'KARANTINA AKTIF' : undefined,
    });
  }

  for (const r of reproduction) {
    const labels: Record<string, string> = {
      estrus: 'Birahi',
      mating: 'Kawin',
      pregnancy_check: 'Cek Bunting',
      birth: 'Kelahiran',
      abortion: 'Aborsi',
      weaning: 'Sapih',
    };
    timeline.push({
      _id: r._id.toString(),
      type: 'reproduction',
      date: r.event_date.toISOString(),
      title: labels[r.event_type] ?? r.event_type,
      summary: r.notes ?? '',
      icon: 'baby-face-outline',
    });
  }

  for (const r of statusHistory) {
    timeline.push({
      _id: r._id.toString(),
      type: 'status',
      date: r.changed_date.toISOString(),
      title: `Status: ${r.status_from} → ${r.status_to}`,
      summary: r.reason,
      icon: 'flag-outline',
    });
  }

  // Sort all events by date descending
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return timeline;
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

export async function transferPen(
  livestockId: string,
  newPenId: string,
  farmId: string,
) {
  const livestock = await Livestock.findById(livestockId);
  assertBelongsToFarm(livestock, farmId, 'Ternak');

  const oldPenId = livestock.current_pen_id?.toString();
  if (oldPenId === newPenId) {
    throw new AppError('Ternak sudah berada di kandang ini', 400);
  }

  // Update pen occupancy
  livestock.current_pen_id = newPenId as any;
  await livestock.save();

  if (oldPenId) await decrementOccupancy(oldPenId);
  await incrementOccupancy(newPenId);

  return livestock;
}

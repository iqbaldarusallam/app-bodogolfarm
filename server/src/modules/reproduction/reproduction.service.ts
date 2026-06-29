import { ReproductionRecord } from '../../models/reproduction-record.model';
import { Livestock } from '../../models/livestock.model';
import { AppError, assertLivestockBelongsToFarm } from '../../middlewares';
import { CreateReproductionRecordInput, UpdateReproductionRecordInput } from './reproduction.validator';
import { ReproductionEventType, LivestockSex } from '../../types/enums';

export async function getByLivestock(livestockId: string) {
  return ReproductionRecord.find({ livestock_id: livestockId })
    .populate('sire_id', 'ear_tag name')
    .populate('recorded_by', 'name')
    .sort({ event_date: -1 });
}

export async function getById(id: string, farmId: string) {
  const record = await ReproductionRecord.findById(id)
    .populate('livestock_id', 'ear_tag name sex farm_id')
    .populate('sire_id', 'ear_tag name')
    .populate('offspring_ids', 'ear_tag name')
    .populate('recorded_by', 'name');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan reproduksi');
  return record;
}

export async function create(input: CreateReproductionRecordInput, userId: string) {
  // F2: Enforce female-only for reproduction events
  const livestock = await Livestock.findById(input.livestock_id);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);
  if (livestock.sex !== LivestockSex.FEMALE) {
    throw new AppError('Reproduksi hanya dapat dicatat untuk ternak betina', 400);
  }

  // Compute expected_birth_date for mating events
  let expectedBirthDate: Date | undefined;
  if (input.gestation_days_expected && input.event_date) {
    expectedBirthDate = new Date(input.event_date);
    expectedBirthDate.setDate(expectedBirthDate.getDate() + input.gestation_days_expected);
  }

  // F4: Compute days_open for birth events
  let daysOpen = input.days_open;
  let serviceCount = input.service_count;

  if (input.event_type === ReproductionEventType.BIRTH && input.event_date) {
    // Find the last mating event for this livestock
    const lastMating = await ReproductionRecord.findOne({
      livestock_id: input.livestock_id,
      event_type: ReproductionEventType.MATING,
      event_date: { $lte: input.event_date },
    }).sort({ event_date: -1 });

    if (lastMating) {
      // days_open = birth_date - last_mating_date
      const diffMs = new Date(input.event_date).getTime() - new Date(lastMating.event_date).getTime();
      daysOpen = Math.round(diffMs / (1000 * 60 * 60 * 24));

      // Count services (matings) from last successful birth or first mating
      const lastBirth = await ReproductionRecord.findOne({
        livestock_id: input.livestock_id,
        event_type: ReproductionEventType.BIRTH,
        event_date: { $lt: input.event_date },
      }).sort({ event_date: -1 });

      const serviceStartDate = lastBirth?.event_date ?? new Date('2000-01-01');
      serviceCount = await ReproductionRecord.countDocuments({
        livestock_id: input.livestock_id,
        event_type: ReproductionEventType.MATING,
        event_date: { $gt: serviceStartDate, $lte: input.event_date },
      });
    }
  }

  return ReproductionRecord.create({
    ...input,
    recorded_by: userId,
    expected_birth_date: expectedBirthDate,
    ...(daysOpen != null ? { days_open: daysOpen } : {}),
    ...(serviceCount != null ? { service_count: serviceCount } : {}),
  });
}

export async function update(id: string, input: UpdateReproductionRecordInput, farmId: string) {
  const existing = await ReproductionRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(existing, farmId, 'Catatan reproduksi');
  const record = await ReproductionRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return record;
}

export async function remove(id: string, farmId: string) {
  const record = await ReproductionRecord.findById(id).populate('livestock_id', 'farm_id');
  assertLivestockBelongsToFarm(record, farmId, 'Catatan reproduksi');
  await ReproductionRecord.findByIdAndDelete(id);
  return { message: 'Catatan reproduksi berhasil dihapus' };
}

export async function getPregnancies(farmId: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId, sex: 'female' }).distinct('_id');

  return ReproductionRecord.find({
    livestock_id: { $in: livestockIds },
    event_type: ReproductionEventType.PREGNANCY_CHECK,
    pregnancy_status: 'positive',
  })
    .populate('livestock_id', 'ear_tag name')
    .sort({ event_date: -1 });
}

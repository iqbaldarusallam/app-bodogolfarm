import { Livestock } from '../../models/livestock.model';
import { ReproductionRecord } from '../../models/reproduction-record.model';
import { LivestockStatus, ReproductionEventType, LivestockSex } from '../../types/enums';

/**
 * Calculate reproductive KPI for a farm
 */
export async function getReproductiveKPI(farmId: string) {
  // Get all female livestock
  const femaleLivestock = await Livestock.find({
    farm_id: farmId,
    sex: LivestockSex.FEMALE,
    current_status: { $in: [LivestockStatus.ACTIVE, LivestockStatus.SICK, LivestockStatus.QUARANTINE] },
  }).lean();

  // Get all breeding records
  const breedingRecords = await ReproductionRecord.find({
    livestock_id: { $in: femaleLivestock.map((l) => l._id) },
    event_type: ReproductionEventType.MATING,
  }).lean();

  // Get all birth records
  const birthRecords = await ReproductionRecord.find({
    livestock_id: { $in: femaleLivestock.map((l) => l._id) },
    event_type: ReproductionEventType.BIRTH,
  }).lean();

  // Calculate KPI
  const totalMating = breedingRecords.length;
  const totalPregnant = await ReproductionRecord.countDocuments({
    livestock_id: { $in: femaleLivestock.map((l) => l._id) },
    event_type: ReproductionEventType.PREGNANCY_CHECK,
    pregnancy_status: 'positive',
  });
  const totalBirths = birthRecords.length;
  const totalBornAlive = birthRecords.reduce((sum, r) => sum + (r.offspring_count ?? 0), 0);

  const conceptionRate = totalMating > 0 ? (totalPregnant / totalMating) * 100 : 0;
  const kiddingRate = totalBirths > 0 ? totalBornAlive / totalBirths : 0;

  // Individual doe performance
  const doePerformance = await Promise.all(
    femaleLivestock.map(async (doe) => {
      const doeBreeding = await ReproductionRecord.countDocuments({
        livestock_id: doe._id,
        event_type: ReproductionEventType.MATING,
      });

      const doePregnant = await ReproductionRecord.countDocuments({
        livestock_id: doe._id,
        event_type: ReproductionEventType.PREGNANCY_CHECK,
        pregnancy_status: 'positive',
      });

      const doeBirths = await ReproductionRecord.countDocuments({
        livestock_id: doe._id,
        event_type: ReproductionEventType.BIRTH,
      });

      const doeBornAlive = await ReproductionRecord.find({
        livestock_id: doe._id,
        event_type: ReproductionEventType.BIRTH,
      }).lean();

      const totalKids = doeBornAlive.reduce((sum, r) => sum + (r.offspring_count ?? 0), 0);

      const doeConceptionRate = doeBreeding > 0 ? (doePregnant / doeBreeding) * 100 : 0;

      return {
        livestock_id: doe._id,
        ear_tag: doe.ear_tag,
        name: doe.name,
        total_breeding_attempts: doeBreeding,
        total_pregnant: doePregnant,
        total_births: doeBirths,
        total_kids: totalKids,
        conception_rate: doeConceptionRate,
        is_low_performer: doeConceptionRate < 50 && doeBreeding >= 3,
      };
    }),
  );

  const lowPerformers = doePerformance.filter((d) => d.is_low_performer);

  return {
    farm_kpi: {
      total_doe: femaleLivestock.length,
      total_mating: totalMating,
      total_pregnant: totalPregnant,
      total_births: totalBirths,
      total_born_alive: totalBornAlive,
      conception_rate: Math.round(conceptionRate * 100) / 100,
      kidding_rate: Math.round(kiddingRate * 100) / 100,
    },
    doe_performance: doePerformance.sort((a, b) => a.conception_rate - b.conception_rate),
    low_performers: lowPerformers,
  };
}

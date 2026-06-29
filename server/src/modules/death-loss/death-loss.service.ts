import { DeathLossRecord } from '../../models/death-loss-record.model';
import { Livestock } from '../../models/livestock.model';
import { GrowthRecord } from '../../models/growth-record.model';
import { FeedingLog } from '../../models/feeding-log.model';
import { MedicationLog } from '../../models/medication-log.model';
import { VaccinationRecord } from '../../models/vaccination-record.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';

/**
 * Auto-calculate death loss when a death is recorded.
 * Should be called after death status is set on livestock.
 */
export async function calculateDeathLoss(
  livestockId: string,
  deathCause: string,
  deathDate: Date,
  userId: string,
): Promise<void> {
  const livestock = await Livestock.findById(livestockId);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);

  // Check if death loss already exists for this livestock
  const existing = await DeathLossRecord.findOne({ livestock_id: livestockId });
  if (existing) return; // Already calculated

  // Get last weight
  const lastGrowth = await GrowthRecord.findOne({ livestock_id: livestockId })
    .sort({ record_date: -1 })
    .lean();

  const lastWeightKg = lastGrowth?.weight_kg ?? 0;
  const lastWeightDate = lastGrowth?.record_date ?? livestock.birth_date;

  // Calculate age at death
  const birthDate = new Date(livestock.birth_date);
  const deathDateObj = new Date(deathDate);
  const ageAtDeathDays = Math.floor((deathDateObj.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

  // Get pen code at death
  const penCode = (livestock.current_pen_id as any)?.pen_code ?? '';

  // Calculate total feed cost (estimate from feeding logs)
  const feedingLogs = await FeedingLog.find({ livestock_id: livestockId }).lean();
  // Note: In real implementation, would need feed master prices
  // For now, use a placeholder calculation
  const totalFeedCost = 0; // Would need feed master prices

  // Calculate total medicine cost
  const medicationLogs = await MedicationLog.find({ livestock_id: livestockId }).lean();
  const totalMedicineCost = 0; // Would need medicine prices

  // Calculate total vaccine cost
  const vaccinationRecords = await VaccinationRecord.find({ livestock_id: livestockId }).lean();
  const totalVaccineCost = 0; // Would need vaccine prices

  // Total investment
  const purchasePrice = livestock.purchase_price ?? 0;
  const totalInvestment = purchasePrice + totalFeedCost + totalMedicineCost + totalVaccineCost;

  // Market value loss (placeholder - would need market price data)
  const estimatedMarketValue = 0; // Would need market price per kg
  const isMarketPriceAvailable = false;

  // Total loss
  const totalLoss = totalInvestment + estimatedMarketValue;

  // Create death loss record
  await DeathLossRecord.create({
    farm_id: livestock.farm_id,
    livestock_id: livestockId,
    snapshot: {
      ear_tag: livestock.ear_tag,
      name: livestock.name,
      species: livestock.species,
      breed: livestock.breed,
      sex: livestock.sex,
      age_at_death_days: ageAtDeathDays,
      last_weight_kg: lastWeightKg,
      last_weight_date: lastWeightDate,
      death_date: deathDate,
      death_cause: deathCause,
      cage_at_death: penCode,
    },
    market_value_loss: {
      price_per_kg_used: 0,
      estimated_market_value: estimatedMarketValue,
      is_market_price_available: isMarketPriceAvailable,
    },
    investment_cost: {
      purchase_price: purchasePrice,
      total_feed_cost: totalFeedCost,
      total_medicine_cost: totalMedicineCost,
      total_vaccine_cost: totalVaccineCost,
      total_investment: totalInvestment,
    },
    total_loss: totalLoss,
    is_complete_calculation: isMarketPriceAvailable,
    calculation_notes: isMarketPriceAvailable
      ? ''
      : 'Perhitungan belum lengkap: harga pasar per kg belum dikonfigurasi',
    calculated_at: new Date(),
    calculated_by: userId,
  });
}

/**
 * Get all death loss records for a farm
 */
export async function getAll(farmId: string) {
  return DeathLossRecord.find({ farm_id: farmId })
    .populate('livestock_id', 'ear_tag name species breed')
    .sort({ created_at: -1 });
}

/**
 * Get death loss summary for a period
 */
export async function getSummary(farmId: string, startDate?: string, endDate?: string) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (startDate || endDate) {
    filter['snapshot.death_date'] = {};
    if (startDate) (filter['snapshot.death_date'] as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate) (filter['snapshot.death_date'] as Record<string, unknown>).$lte = new Date(endDate);
  }

  const records = await DeathLossRecord.find(filter).lean();

  const totalLoss = records.reduce((sum, r) => sum + (r.total_loss ?? 0), 0);
  const totalInvestment = records.reduce((sum, r) => sum + (r.investment_cost?.total_investment ?? 0), 0);
  const totalMarketValue = records.reduce((sum, r) => sum + (r.market_value_loss?.estimated_market_value ?? 0), 0);
  const avgLoss = records.length > 0 ? totalLoss / records.length : 0;

  // Death by cause
  const causeCount: Record<string, number> = {};
  records.forEach((r) => {
    const cause = r.snapshot?.death_cause ?? 'Unknown';
    causeCount[cause] = (causeCount[cause] ?? 0) + 1;
  });

  // Death by species
  const speciesCount: Record<string, number> = {};
  records.forEach((r) => {
    const species = r.snapshot?.species ?? 'Unknown';
    speciesCount[species] = (speciesCount[species] ?? 0) + 1;
  });

  return {
    total_count: records.length,
    total_loss: totalLoss,
    total_investment: totalInvestment,
    total_market_value: totalMarketValue,
    average_loss: avgLoss,
    by_cause: Object.entries(causeCount).map(([cause, count]) => ({ cause, count })),
    by_species: Object.entries(speciesCount).map(([species, count]) => ({ species, count })),
  };
}

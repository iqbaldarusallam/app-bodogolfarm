import { MarketPrice } from '../../models/market-price.model';
import { Livestock } from '../../models/livestock.model';
import { GrowthRecord } from '../../models/growth-record.model';
import { FeedingLog } from '../../models/feeding-log.model';
import { MedicationLog } from '../../models/medication-log.model';
import { VaccinationRecord } from '../../models/vaccination-record.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';
import { LivestockStatus } from '../../types/enums';

export interface ProfitabilityResult {
  livestock_id: string;
  ear_tag: string;
  name?: string;
  current_weight_kg: number;
  market_price_per_kg: number;
  estimated_market_value: number;
  purchase_price: number;
  total_feed_cost: number;
  total_medicine_cost: number;
  total_vaccine_cost: number;
  total_investment: number;
  estimated_profit: number;
  profit_margin_percent: number;
  break_even_weight_kg: number;
  is_profitable: boolean;
}

/**
 * Calculate profitability for a single livestock
 */
export async function calculateProfitability(livestockId: string, farmId: string): Promise<ProfitabilityResult> {
  const livestock = await Livestock.findById(livestockId);
  if (!livestock) throw new AppError('Ternak tidak ditemukan', 404);
  assertBelongsToFarm(livestock, farmId, 'Ternak');

  // Get current weight
  const lastGrowth = await GrowthRecord.findOne({ livestock_id: livestockId })
    .sort({ record_date: -1 })
    .lean();
  const currentWeightKg = lastGrowth?.weight_kg ?? 0;

  // Get active market price for this livestock's category
  const category = livestock.sex === 'male' ? 'jantan_dewasa' : 'betina_dewasa';
  const marketPrice = await MarketPrice.findOne({
    farm_id: farmId,
    category,
    is_active: true,
  }).sort({ effective_date: -1 }).lean();

  const pricePerKg = marketPrice?.price_per_kg ?? 0;
  const estimatedMarketValue = currentWeightKg * pricePerKg;

  // Get costs
  const feedingLogs = await FeedingLog.find({ livestock_id: livestockId }).lean();
  const totalFeedCost = 0; // Would need feed master prices

  const medicationLogs = await MedicationLog.find({ livestock_id: livestockId }).lean();
  const totalMedicineCost = 0; // Would need medicine prices

  const vaccinationRecords = await VaccinationRecord.find({ livestock_id: livestockId }).lean();
  const totalVaccineCost = 0; // Would need vaccine prices

  // Total investment
  const purchasePrice = livestock.purchase_price ?? 0;
  const totalInvestment = purchasePrice + totalFeedCost + totalMedicineCost + totalVaccineCost;

  // Profit calculation
  const estimatedProfit = estimatedMarketValue - totalInvestment;
  const profitMarginPercent = totalInvestment > 0 ? (estimatedProfit / totalInvestment) * 100 : 0;

  // Break-even weight
  const breakEvenWeightKg = pricePerKg > 0 ? totalInvestment / pricePerKg : 0;

  return {
    livestock_id: livestockId,
    ear_tag: livestock.ear_tag,
    name: livestock.name,
    current_weight_kg: currentWeightKg,
    market_price_per_kg: pricePerKg,
    estimated_market_value: estimatedMarketValue,
    purchase_price: purchasePrice,
    total_feed_cost: totalFeedCost,
    total_medicine_cost: totalMedicineCost,
    total_vaccine_cost: totalVaccineCost,
    total_investment: totalInvestment,
    estimated_profit: estimatedProfit,
    profit_margin_percent: profitMarginPercent,
    break_even_weight_kg: breakEvenWeightKg,
    is_profitable: estimatedProfit > 0,
  };
}

/**
 * Calculate profitability for all active livestock in a farm
 */
export async function calculateAllProfitability(farmId: string): Promise<ProfitabilityResult[]> {
  const livestock = await Livestock.find({
    farm_id: farmId,
    current_status: { $in: [LivestockStatus.ACTIVE, LivestockStatus.SICK] },
  }).lean();

  const results: ProfitabilityResult[] = [];
  for (const animal of livestock) {
    try {
      const result = await calculateProfitability(animal._id.toString(), farmId);
      results.push(result);
    } catch (error) {
      // Skip failed calculations
    }
  }

  // Sort by profit (highest first)
  results.sort((a, b) => b.estimated_profit - a.estimated_profit);

  return results;
}

/**
 * Get market price summary
 */
export async function getMarketPrices(farmId: string) {
  return MarketPrice.find({ farm_id: farmId })
    .sort({ effective_date: -1 });
}

/**
 * Create/update market price
 */
export async function setMarketPrice(
  farmId: string,
  category: string,
  pricePerKg: number,
  effectiveDate: Date,
  userId: string,
  options?: { breed?: string; source?: string; notes?: string },
) {
  // Deactivate old prices for this category
  await MarketPrice.updateMany(
    { farm_id: farmId, category, is_active: true },
    { is_active: false },
  );

  return MarketPrice.create({
    farm_id: farmId,
    category,
    breed: options?.breed,
    price_per_kg: pricePerKg,
    effective_date: effectiveDate,
    is_active: true,
    source: options?.source,
    notes: options?.notes,
    recorded_by: userId,
  });
}

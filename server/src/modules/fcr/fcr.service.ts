import { FCRRecord } from '../../models/fcr-record.model';
import { Livestock } from '../../models/livestock.model';
import { Pen } from '../../models/pen.model';
import { GrowthRecord } from '../../models/growth-record.model';
import { FeedingLog } from '../../models/feeding-log.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';

/**
 * Calculate FCR for a specific cage and period
 */
export async function calculateFCR(
  cageId: string,
  periodStart: Date,
  periodEnd: Date,
  farmId: string,
  userId: string,
): Promise<any> {
  // Validate cage belongs to farm
  const pen = await Pen.findById(cageId);
  if (!pen) throw new AppError('Kandang tidak ditemukan', 404);
  assertBelongsToFarm(pen, farmId, 'Kandang');

  const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  if (periodDays < 14) throw new AppError('Minimal periode 14 hari', 400);

  // Get livestock in this cage
  const livestockInCage = await Livestock.find({
    farm_id: farmId,
    current_pen_id: cageId,
  }).lean();

  const livestockIds = livestockInCage.map(l => l._id);

  // Get feed records for this cage in period
  const feedRecords = await FeedingLog.find({
    cage_id: cageId,
    feed_date: { $gte: periodStart, $lte: periodEnd },
  }).lean();

  const totalFeedKg = feedRecords.reduce((sum, r) => sum + (r.amount_given_kg ?? 0), 0);
  const feedRecordCount = feedRecords.length;

  // Get weight records for livestock in this cage
  const weightRecords = await GrowthRecord.find({
    livestock_id: { $in: livestockIds },
    record_date: { $gte: periodStart, $lte: periodEnd },
  }).lean();

  // Calculate weight gain
  let totalWeightGain = 0;
  let livestockWithGain = 0;

  for (const animal of livestockInCage) {
    const startWeight = await GrowthRecord.findOne({
      livestock_id: animal._id,
      record_date: { $lte: periodStart },
    }).sort({ record_date: -1 }).lean();

    const endWeight = await GrowthRecord.findOne({
      livestock_id: animal._id,
      record_date: { $lte: periodEnd },
    }).sort({ record_date: -1 }).lean();

    if (startWeight && endWeight) {
      const gain = endWeight.weight_kg - startWeight.weight_kg;
      if (gain > 0) {
        totalWeightGain += gain;
        livestockWithGain++;
      }
    }
  }

  // Check data sufficiency
  const avgLivestockCount = livestockInCage.length;
  const isDataSufficient = feedRecordCount > 0 && livestockWithGain >= 2;

  // Calculate FCR
  let fcrValue = 0;
  let fcrCategory: 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient_data' = 'insufficient_data';
  let isAlertTriggered = false;

  if (isDataSufficient && totalWeightGain > 0) {
    fcrValue = totalFeedKg / totalWeightGain;

    if (fcrValue < 6) fcrCategory = 'excellent';
    else if (fcrValue < 8) fcrCategory = 'good';
    else if (fcrValue < 12) fcrCategory = 'fair';
    else {
      fcrCategory = 'poor';
      isAlertTriggered = true;
    }
  }

  // ADG calculation
  const avgWeightGainPerHead = livestockWithGain > 0 ? totalWeightGain / livestockWithGain : 0;
  const adgGramPerHead = periodDays > 0 ? (avgWeightGainPerHead / periodDays) * 1000 : 0;

  // Create FCR record
  const fcrRecord = await FCRRecord.create({
    farm_id: farmId,
    cage_id: cageId,
    period_start: periodStart,
    period_end: periodEnd,
    period_days: periodDays,
    feed_data: {
      total_feed_kg: totalFeedKg,
      feed_cost_total: 0, // Would need feed master prices
      feed_record_count: feedRecordCount,
    },
    weight_data: {
      livestock_count_average: avgLivestockCount,
      total_weight_gain_kg: totalWeightGain,
      average_weight_gain_kg_per_head: avgWeightGainPerHead,
      average_daily_gain_gram_per_head: adgGramPerHead,
    },
    fcr: {
      value: fcrValue,
      category: fcrCategory,
      is_alert_triggered: isAlertTriggered,
    },
    feed_items_used: [],
    is_data_sufficient: isDataSufficient,
    insufficient_data_notes: isDataSufficient ? '' : 'Data penimbangan tidak cukup untuk FCR akurat',
    calculated_at: new Date(),
    calculated_by: userId,
  });

  return fcrRecord;
}

/**
 * Get FCR records for a farm
 */
export async function getAll(farmId: string) {
  return FCRRecord.find({ farm_id: farmId })
    .populate('cage_id', 'pen_code pen_type')
    .sort({ period_start: -1 });
}

/**
 * Get FCR summary for dashboard
 */
export async function getSummary(farmId: string) {
  const records = await FCRRecord.find({ farm_id: farmId })
    .sort({ period_start: -1 })
    .limit(10)
    .lean();

  const avgFCR = records.length > 0
    ? records.reduce((sum, r) => sum + (r.fcr?.value ?? 0), 0) / records.length
    : 0;

  const alertCount = records.filter(r => r.fcr?.is_alert_triggered).length;

  return {
    records,
    average_fcr: avgFCR,
    alert_count: alertCount,
  };
}

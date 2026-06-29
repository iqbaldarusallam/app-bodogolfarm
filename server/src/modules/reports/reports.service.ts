import { Livestock } from '../../models/livestock.model';
import { GrowthRecord } from '../../models/growth-record.model';
import { FeedingLog } from '../../models/feeding-log.model';
import { HealthRecord } from '../../models/health-record.model';
import { MedicationLog } from '../../models/medication-log.model';
import { VaccinationRecord } from '../../models/vaccination-record.model';
import { ReproductionRecord } from '../../models/reproduction-record.model';
import { StatusHistory } from '../../models/status-history.model';

export async function getGrowthReport(farmId: string, startDate?: string, endDate?: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter: Record<string, unknown> = {
    livestock_id: { $in: livestockIds },
  };
  if (Object.keys(dateFilter).length > 0) filter.record_date = dateFilter;

  return GrowthRecord.find(filter)
    .populate('livestock_id', 'ear_tag name species breed photo_url')
    .sort({ record_date: -1 }).lean();
}

export async function getFeedingReport(farmId: string, startDate?: string, endDate?: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter: Record<string, unknown> = {
    livestock_id: { $in: livestockIds },
  };
  if (Object.keys(dateFilter).length > 0) filter.feed_date = dateFilter;

  return FeedingLog.find(filter)
    .populate('livestock_id', 'ear_tag name')
    .populate('feed_master_id', 'feed_name feed_type')
    .sort({ feed_date: -1 }).lean();
}

export async function getHealthReport(farmId: string, startDate?: string, endDate?: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter: Record<string, unknown> = {
    livestock_id: { $in: livestockIds },
  };
  if (Object.keys(dateFilter).length > 0) filter.record_date = dateFilter;

  return HealthRecord.find(filter)
    .populate('livestock_id', 'ear_tag name')
    .populate('examiner', 'name')
    .sort({ record_date: -1 }).lean();
}

export async function getMedicationReport(farmId: string, startDate?: string, endDate?: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter: Record<string, unknown> = {
    livestock_id: { $in: livestockIds },
  };
  if (Object.keys(dateFilter).length > 0) filter.start_date = dateFilter;

  return MedicationLog.find(filter)
    .populate('livestock_id', 'ear_tag name')
    .populate('health_record_id', 'record_date diagnosis')
    .sort({ start_date: -1 }).lean();
}

export async function getStatusReport(farmId: string, startDate?: string, endDate?: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter: Record<string, unknown> = {
    livestock_id: { $in: livestockIds },
  };
  if (Object.keys(dateFilter).length > 0) filter.changed_date = dateFilter;

  return StatusHistory.find(filter)
    .populate('livestock_id', 'ear_tag name')
    .populate('changed_by', 'name')
    .sort({ changed_date: -1 }).lean();
}

export async function getWithdrawalAlert(farmId: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId, current_status: { $in: ['active', 'sick', 'quarantine'] } }).distinct('_id');

  return MedicationLog.find({
    livestock_id: { $in: livestockIds },
    withdrawal_period_days: { $gt: 0 },
    withdrawal_end_date: { $gte: new Date() },
  })
    .populate('livestock_id', 'ear_tag name species breed current_status')
    .sort({ withdrawal_end_date: 1 }).lean();
}

export async function getVaccinationDue(farmId: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId, current_status: { $in: ['active', 'sick', 'quarantine'] } }).distinct('_id');

  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  return VaccinationRecord.find({
    livestock_id: { $in: livestockIds },
    booster_due_date: { $lte: in30Days },
  })
    .populate('livestock_id', 'ear_tag name species breed')
    .sort({ booster_due_date: 1 }).lean();
}

export async function getReproductionReport(farmId: string, startDate?: string, endDate?: string) {
  const livestockIds = await Livestock.find({ farm_id: farmId }).distinct('_id');
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter: Record<string, unknown> = {
    livestock_id: { $in: livestockIds },
  };
  if (Object.keys(dateFilter).length > 0) filter.event_date = dateFilter;

  return ReproductionRecord.find(filter)
    .populate('livestock_id', 'ear_tag name')
    .populate('sire_id', 'ear_tag name')
    .sort({ event_date: -1 }).lean();
}

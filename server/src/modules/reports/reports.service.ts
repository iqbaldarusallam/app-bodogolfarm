import { Livestock } from '../../models/livestock.model';
import { GrowthRecord } from '../../models/growth-record.model';
import { FeedingLog } from '../../models/feeding-log.model';
import { HealthRecord } from '../../models/health-record.model';
import { MedicationLog } from '../../models/medication-log.model';
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
    .populate('livestock_id', 'ear_tag name species breed')
    .sort({ record_date: -1 });
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
    .sort({ feed_date: -1 });
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
    .sort({ record_date: -1 });
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
    .sort({ start_date: -1 });
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
    .sort({ changed_date: -1 });
}

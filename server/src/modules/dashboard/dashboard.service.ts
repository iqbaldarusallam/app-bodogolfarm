import mongoose from 'mongoose';
import { Livestock } from '../../models/livestock.model';
import { GrowthRecord } from '../../models/growth-record.model';
import { HealthRecord } from '../../models/health-record.model';
import { QuarantineRecord } from '../../models/quarantine-record.model';
import { VaccinationRecord } from '../../models/vaccination-record.model';
import { MedicationLog } from '../../models/medication-log.model';
import { ReproductionRecord } from '../../models/reproduction-record.model';
import {
  LivestockStatus,
  LivestockSex,
  PregnancyStatus,
  QuarantineStatus,
} from '../../types/enums';

export async function getSummary(farmId: string) {
  // aggregate $match TIDAK auto-cast string → ObjectId, jadi cast manual.
  const farmObjectId = new mongoose.Types.ObjectId(farmId);

  // Ambil id ternak SEKALI saja lalu dipakai ulang (sebelumnya 6x query distinct identik).
  const [livestockIds, femaleIds] = await Promise.all([
    Livestock.find({ farm_id: farmId }).distinct('_id'),
    Livestock.find({ farm_id: farmId, sex: LivestockSex.FEMALE }).distinct('_id'),
  ]);

  const now = new Date();
  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  const [
    totalLivestock,
    statusCounts,
    recentGrowth,
    activeQuarantine,
    upcomingBoosters,
    activeWithdrawals,
    pregnantLivestock,
    recentHealth,
  ] = await Promise.all([
    // Total ternak
    Livestock.countDocuments({ farm_id: farmId }),

    // Hitung per status (ObjectId cast)
    Livestock.aggregate([
      { $match: { farm_id: farmObjectId } },
      { $group: { _id: '$current_status', count: { $sum: 1 } } },
    ]),

    // 5 record pertumbuhan terakhir
    GrowthRecord.find({ livestock_id: { $in: livestockIds } })
      .populate('livestock_id', 'ear_tag name')
      .sort({ record_date: -1 })
      .limit(5)
      .lean(),

    // Karantina aktif (count langsung, tanpa populate)
    QuarantineRecord.countDocuments({
      livestock_id: { $in: livestockIds },
      status: QuarantineStatus.ACTIVE,
    }),

    // Booster jatuh tempo (14 hari ke depan)
    VaccinationRecord.find({
      livestock_id: { $in: livestockIds },
      booster_due_date: { $gte: now, $lte: twoWeeks },
    })
      .populate('livestock_id', 'ear_tag name')
      .sort({ booster_due_date: 1 })
      .limit(5)
      .lean(),

    // Withdrawal aktif
    MedicationLog.find({
      livestock_id: { $in: livestockIds },
      withdrawal_end_date: { $gte: now },
    })
      .populate('livestock_id', 'ear_tag name')
      .sort({ withdrawal_end_date: 1 })
      .limit(5)
      .lean(),

    // Bunting (hanya ternak betina)
    ReproductionRecord.find({
      livestock_id: { $in: femaleIds },
      pregnancy_status: PregnancyStatus.POSITIVE,
    })
      .populate('livestock_id', 'ear_tag name')
      .sort({ event_date: -1 })
      .limit(5)
      .lean(),

    // Pemeriksaan kesehatan terakhir
    HealthRecord.find({ livestock_id: { $in: livestockIds } })
      .populate('livestock_id', 'ear_tag name')
      .populate('examiner', 'name')
      .sort({ record_date: -1 })
      .limit(5)
      .lean(),
  ]);

  // Format status counts
  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s: { _id: string; count: number }) => {
    statusMap[s._id] = s.count;
  });

  return {
    livestock: {
      total: totalLivestock,
      active: statusMap[LivestockStatus.ACTIVE] || 0,
      sick: statusMap[LivestockStatus.SICK] || 0,
      quarantine: statusMap[LivestockStatus.QUARANTINE] || 0,
      sold: statusMap[LivestockStatus.SOLD] || 0,
      dead: statusMap[LivestockStatus.DEAD] || 0,
      transferred: statusMap[LivestockStatus.TRANSFERRED] || 0,
    },
    quarantine: { active: activeQuarantine },
    alerts: {
      upcoming_boosters: upcomingBoosters,
      active_withdrawals: activeWithdrawals,
      pregnant_livestock: pregnantLivestock,
    },
    recent: {
      growth: recentGrowth,
      health: recentHealth,
    },
  };
}

import { Livestock } from '../../models/livestock.model';
import { GrowthRecord } from '../../models/growth-record.model';
import { HealthRecord } from '../../models/health-record.model';
import { QuarantineRecord } from '../../models/quarantine-record.model';
import { VaccinationRecord } from '../../models/vaccination-record.model';
import { MedicationLog } from '../../models/medication-log.model';
import { ReproductionRecord } from '../../models/reproduction-record.model';
import { LivestockStatus, QuarantineStatus } from '../../types/enums';

export async function getSummary(farmId: string) {
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

    // Hitung per status
    Livestock.aggregate([
      { $match: { farm_id: farmId } },
      { $group: { _id: '$current_status', count: { $sum: 1 } } },
    ]),

    // 5 record pertumbuhan terakhir
    Livestock.find({ farm_id: farmId }).distinct('_id').then((ids) =>
      GrowthRecord.find({ livestock_id: { $in: ids } })
        .populate('livestock_id', 'ear_tag name')
        .sort({ record_date: -1 })
        .limit(5),
    ),

    // Karantina aktif
    Livestock.find({ farm_id: farmId }).distinct('_id').then((ids) =>
      QuarantineRecord.find({
        livestock_id: { $in: ids },
        status: QuarantineStatus.ACTIVE,
      })
        .populate('livestock_id', 'ear_tag name')
        .countDocuments(),
    ),

    // Booster yang akan jatuh tempo (14 hari ke depan)
    Livestock.find({ farm_id: farmId }).distinct('_id').then((ids) => {
      const twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      return VaccinationRecord.find({
        livestock_id: { $in: ids },
        booster_due_date: { $gte: new Date(), $lte: twoWeeks },
      })
        .populate('livestock_id', 'ear_tag name')
        .sort({ booster_due_date: 1 })
        .limit(5);
    }),

    // Withdrawal aktif
    Livestock.find({ farm_id: farmId }).distinct('_id').then((ids) =>
      MedicationLog.find({
        livestock_id: { $in: ids },
        withdrawal_end_date: { $gte: new Date() },
      })
        .populate('livestock_id', 'ear_tag name')
        .sort({ withdrawal_end_date: 1 })
        .limit(5),
    ),

    // Bunting
    Livestock.find({ farm_id: farmId, sex: 'female' }).distinct('_id').then((ids) =>
      ReproductionRecord.find({
        livestock_id: { $in: ids },
        pregnancy_status: 'positive',
      })
        .populate('livestock_id', 'ear_tag name')
        .sort({ event_date: -1 })
        .limit(5),
    ),

    // Pemeriksaan kesehatan terakhir
    Livestock.find({ farm_id: farmId }).distinct('_id').then((ids) =>
      HealthRecord.find({ livestock_id: { $in: ids } })
        .populate('livestock_id', 'ear_tag name')
        .populate('examiner', 'name')
        .sort({ record_date: -1 })
        .limit(5),
    ),
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

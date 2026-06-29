import { HealthRecord } from '../../models/health-record.model';
import { MedicationLog } from '../../models/medication-log.model';
import { DeathLossRecord } from '../../models/death-loss-record.model';

/**
 * Get treatment effectiveness summary
 */
export async function getEffectivenessSummary(farmId: string, startDate?: string, endDate?: string) {
  const filter: Record<string, unknown> = {};
  if (startDate || endDate) {
    filter.record_date = {};
    if (startDate) (filter.record_date as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate) (filter.record_date as Record<string, unknown>).$lte = new Date(endDate);
  }

  // Get health records with treatment
  const healthRecords = await HealthRecord.find({
    farm_id: farmId,
    ...filter,
  }).lean();

  // Get medication logs
  const medicationLogs = await MedicationLog.find({
    livestock_id: { $in: healthRecords.map((h) => h.livestock_id) },
  }).lean();

  // Calculate treatment stats
  const totalTreatments = medicationLogs.length;
  const completedTreatments = medicationLogs.filter((m) => m.end_date).length;

  // Get death records in period
  const deathRecords = await DeathLossRecord.find({
    farm_id: farmId,
    ...filter,
  }).lean();

  // By diagnosis
  const byDiagnosis: Record<string, { count: number; treatments: number }> = {};
  healthRecords.forEach((h) => {
    const diagnosis = h.diagnosis || h.chief_complaint || 'Unknown';
    if (!byDiagnosis[diagnosis]) byDiagnosis[diagnosis] = { count: 0, treatments: 0 };
    byDiagnosis[diagnosis].count++;
  });

  medicationLogs.forEach((m) => {
    const medicine = m.medicine_name || 'Unknown';
    if (!byDiagnosis[medicine]) byDiagnosis[medicine] = { count: 0, treatments: 0 };
    byDiagnosis[medicine].treatments++;
  });

  // Top medicines used
  const medicineCount: Record<string, number> = {};
  medicationLogs.forEach((m) => {
    const medicine = m.medicine_name || 'Unknown';
    medicineCount[medicine] = (medicineCount[medicine] ?? 0) + 1;
  });

  const topMedicines = Object.entries(medicineCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return {
    total_treatments: totalTreatments,
    completed_treatments: completedTreatments,
    death_count: deathRecords.length,
    top_diagnoses: Object.entries(byDiagnosis)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([diagnosis, data]) => ({ diagnosis, ...data })),
    top_medicines: topMedicines,
  };
}

/**
 * Get treatment outcomes by livestock
 */
export async function getOutcomesByLivestock(farmId: string) {
  const healthRecords = await HealthRecord.find({ farm_id: farmId })
    .populate('livestock_id', 'ear_tag name species breed')
    .sort({ record_date: -1 })
    .limit(50)
    .lean();

  return healthRecords.map((h) => ({
    livestock: h.livestock_id,
    diagnosis: h.diagnosis || h.chief_complaint,
    date: h.record_date,
    is_infectious: h.is_infectious,
  }));
}

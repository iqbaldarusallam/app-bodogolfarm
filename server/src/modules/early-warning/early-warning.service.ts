import { EarlyWarningAlert } from '../../models/early-warning.model';
import { AppError, assertLivestockBelongsToFarm } from '../../middlewares';

/**
 * Get all active alerts for a farm
 */
export async function getActiveAlerts(farmId: string) {
  return EarlyWarningAlert.find({
    farm_id: farmId,
    status: { $in: ['active', 'acknowledged', 'escalated'] },
  })
    .populate('trigger_livestock_id', 'ear_tag name')
    .populate('trigger_cage_id', 'pen_code')
    .sort({ triggered_at: -1 });
}

/**
 * Get alert summary
 */
export async function getAlertSummary(farmId: string) {
  const alerts = await EarlyWarningAlert.find({
    farm_id: farmId,
    status: { $in: ['active', 'acknowledged', 'escalated'] },
  }).lean();

  const high = alerts.filter((a) => a.priority === 'high').length;
  const medium = alerts.filter((a) => a.priority === 'medium').length;
  const low = alerts.filter((a) => a.priority === 'low').length;

  return {
    total: alerts.length,
    high,
    medium,
    low,
    alerts,
  };
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string, userId: string, farmId: string) {
  const alert = await EarlyWarningAlert.findById(alertId);
  if (!alert) throw new AppError('Alert tidak ditemukan', 404);

  alert.status = 'acknowledged';
  alert.acknowledged_at = new Date();
  alert.acknowledged_by = userId as any;

  await alert.save();
  return alert;
}

/**
 * Resolve an alert
 */
export async function resolveAlert(
  alertId: string,
  userId: string,
  farmId: string,
  notes?: string,
) {
  const alert = await EarlyWarningAlert.findById(alertId);
  if (!alert) throw new AppError('Alert tidak ditemukan', 404);

  alert.status = 'resolved';
  alert.resolved_at = new Date();
  alert.resolved_by = userId as any;
  if (notes) alert.resolution_notes = notes;

  await alert.save();
  return alert;
}

/**
 * Create a manual alert
 */
export async function createAlert(
  farmId: string,
  input: {
    rule_code: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    recommended_action?: string;
    trigger_livestock_id?: string;
    trigger_cage_id?: string;
  },
  userId: string,
) {
  return EarlyWarningAlert.create({
    farm_id: farmId,
    rule_id: '000000000000000000000000' as any, // Manual alert
    rule_code: input.rule_code,
    priority: input.priority,
    trigger_entity: input.trigger_livestock_id ? 'livestock' : input.trigger_cage_id ? 'cage' : 'farm',
    trigger_livestock_id: input.trigger_livestock_id as any,
    trigger_cage_id: input.trigger_cage_id as any,
    title: input.title,
    message: input.message,
    recommended_action: input.recommended_action,
    status: 'active',
    triggered_at: new Date(),
  });
}

/**
 * Get all alerts for history
 */
export async function getAlertHistory(farmId: string, status?: string) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (status) filter.status = status;

  return EarlyWarningAlert.find(filter)
    .populate('trigger_livestock_id', 'ear_tag name')
    .populate('trigger_cage_id', 'pen_code')
    .sort({ triggered_at: -1 })
    .limit(50);
}

import { FarmOperationChecklist, IChecklistItem } from '../../models/farm-operation-checklist.model';
import { AppError } from '../../middlewares';

// ── Daily Checklist Items ──
const DAILY_ITEMS: Omit<IChecklistItem, 'status'>[] = [
  { item_code: 'D-001', title: 'Cek dashboard alert', module_target: 'dashboard', priority: 'high' },
  { item_code: 'D-002', title: 'Pakan pagi', module_target: 'feeding', priority: 'high' },
  { item_code: 'D-003', title: 'Health check ternak sakit/karantina', module_target: 'health', priority: 'high' },
  { item_code: 'D-004', title: 'Update treatment aktif', module_target: 'medication', priority: 'medium' },
  { item_code: 'D-005', title: 'Cek stok pakan', module_target: 'inventory', priority: 'medium' },
  { item_code: 'D-006', title: 'Pakan sore', module_target: 'feeding', priority: 'medium' },
  { item_code: 'D-007', title: 'Cek ternak karantina', module_target: 'quarantine', priority: 'medium' },
  { item_code: 'D-008', title: 'Review aktivitas harian', module_target: 'dashboard', priority: 'low' },
];

// ── Weekly Checklist Items ──
const WEEKLY_ITEMS: Omit<IChecklistItem, 'status'>[] = [
  { item_code: 'W-001', title: 'Penimbangan ternak', module_target: 'growth', priority: 'high' },
  { item_code: 'W-002', title: 'Review growth stagnation', module_target: 'growth', priority: 'medium' },
  { item_code: 'W-003', title: 'Review sale candidate', module_target: 'reports', priority: 'medium' },
  { item_code: 'W-004', title: 'Review breeding candidate', module_target: 'reports', priority: 'medium' },
  { item_code: 'W-005', title: 'Review kandang FCR buruk', module_target: 'fcr', priority: 'medium' },
  { item_code: 'W-006', title: 'Review ternak sakit berulang', module_target: 'health', priority: 'high' },
  { item_code: 'W-007', title: 'Review vaksin due 7 hari', module_target: 'vaccination', priority: 'high' },
];

// ── Monthly Checklist Items ──
const MONTHLY_ITEMS: Omit<IChecklistItem, 'status'>[] = [
  { item_code: 'M-001', title: 'Review biaya pakan', module_target: 'reports', priority: 'high' },
  { item_code: 'M-002', title: 'Review biaya obat/vaksin', module_target: 'reports', priority: 'high' },
  { item_code: 'M-003', title: 'Review profitabilitas', module_target: 'profitability', priority: 'medium' },
  { item_code: 'M-004', title: 'Review mortality/death loss', module_target: 'death-loss', priority: 'high' },
  { item_code: 'M-005', title: 'Review disease pattern', module_target: 'health', priority: 'medium' },
  { item_code: 'M-006', title: 'Review performa reproduksi', module_target: 'reproduction', priority: 'medium' },
  { item_code: 'M-007', title: 'Review stok & kebutuhan bulan depan', module_target: 'inventory', priority: 'medium' },
  { item_code: 'M-008', title: 'Catatan evaluasi bulanan', module_target: 'dashboard', priority: 'low' },
];

/**
 * Generate or get checklist for a specific date
 */
export async function getOrCreateChecklist(
  farmId: string,
  checklistType: 'daily' | 'weekly' | 'monthly',
  date: Date,
): Promise<any> {
  // Check if checklist already exists for this date
  const existing = await FarmOperationChecklist.findOne({
    farm_id: farmId,
    checklist_type: checklistType,
    checklist_date: {
      $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    },
  });

  if (existing) return existing;

  // Get items based on type
  let items: Omit<IChecklistItem, 'status'>[];
  switch (checklistType) {
    case 'daily': items = DAILY_ITEMS; break;
    case 'weekly': items = WEEKLY_ITEMS; break;
    case 'monthly': items = MONTHLY_ITEMS; break;
  }

  // Create checklist
  return FarmOperationChecklist.create({
    farm_id: farmId,
    checklist_type: checklistType,
    checklist_date: date,
    items: items.map(item => ({ ...item, status: 'pending' })),
    status: 'active',
  });
}

/**
 * Get today's checklist for a farm
 */
export async function getTodayChecklist(farmId: string) {
  const today = new Date();
  return getOrCreateChecklist(farmId, 'daily', today);
}

/**
 * Complete a checklist item
 */
export async function completeItem(
  checklistId: string,
  itemCode: string,
  userId: string,
): Promise<any> {
  const checklist = await FarmOperationChecklist.findById(checklistId);
  if (!checklist) throw new AppError('Checklist tidak ditemukan', 404);

  const item = checklist.items.find(i => i.item_code === itemCode);
  if (!item) throw new AppError('Item tidak ditemukan', 404);

  item.status = 'completed';
  item.completed_by = userId as any;
  item.completed_at = new Date();

  // Check if all items completed
  const allCompleted = checklist.items.every(i => i.status === 'completed' || i.status === 'skipped');
  if (allCompleted) {
    checklist.status = 'completed';
    checklist.completed_by = userId as any;
    checklist.completed_at = new Date();
  } else {
    checklist.status = 'partially_completed';
  }

  await checklist.save();
  return checklist;
}

/**
 * Skip a checklist item
 */
export async function skipItem(
  checklistId: string,
  itemCode: string,
  reason: string,
): Promise<any> {
  const checklist = await FarmOperationChecklist.findById(checklistId);
  if (!checklist) throw new AppError('Checklist tidak ditemukan', 404);

  const item = checklist.items.find(i => i.item_code === itemCode);
  if (!item) throw new AppError('Item tidak ditemukan', 404);

  if (item.priority === 'high' && !reason) {
    throw new AppError('Item high priority wajib diisi alasan saat di-skip', 400);
  }

  item.status = 'skipped';
  item.skipped_reason = reason;

  // Check if all items completed
  const allCompleted = checklist.items.every(i => i.status === 'completed' || i.status === 'skipped');
  if (allCompleted) {
    checklist.status = 'completed';
  } else {
    checklist.status = 'partially_completed';
  }

  await checklist.save();
  return checklist;
}

/**
 * Get checklist history for a farm
 */
export async function getHistory(farmId: string, type?: string) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (type) filter.checklist_type = type;

  return FarmOperationChecklist.find(filter)
    .sort({ checklist_date: -1 })
    .limit(30);
}

/**
 * Get overdue checklists
 */
export async function getOverdue(farmId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return FarmOperationChecklist.find({
    farm_id: farmId,
    status: 'active',
    checklist_date: { $lt: today },
  }).sort({ checklist_date: 1 });
}

import { OverheadCost } from '../../models/overhead-cost.model';
import { AppError, assertBelongsToFarm } from '../../middlewares';

export async function getAll(farmId: string, startDate?: string, endDate?: string) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (startDate || endDate) {
    filter.expense_date = {};
    if (startDate) (filter.expense_date as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate) (filter.expense_date as Record<string, unknown>).$lte = new Date(endDate);
  }
  return OverheadCost.find(filter)
    .populate('allocated_cage_id', 'pen_code')
    .sort({ expense_date: -1 });
}

export async function getById(id: string, farmId: string) {
  const cost = await OverheadCost.findById(id).populate('allocated_cage_id', 'pen_code pen_type');
  assertBelongsToFarm(cost, farmId, 'Biaya Overhead');
  return cost;
}

export async function create(input: any, userId: string, farmId: string) {
  return OverheadCost.create({
    ...input,
    farm_id: farmId,
    recorded_by: userId,
  });
}

export async function update(id: string, input: any, farmId: string) {
  const existing = await OverheadCost.findById(id);
  assertBelongsToFarm(existing, farmId, 'Biaya Overhead');
  return OverheadCost.findByIdAndUpdate(id, input, { new: true, runValidators: true });
}

export async function remove(id: string, farmId: string) {
  const cost = await OverheadCost.findById(id);
  assertBelongsToFarm(cost, farmId, 'Biaya Overhead');
  await OverheadCost.findByIdAndDelete(id);
  return { message: 'Biaya overhead berhasil dihapus' };
}

export async function getSummary(farmId: string, startDate?: string, endDate?: string) {
  const filter: Record<string, unknown> = { farm_id: farmId };
  if (startDate || endDate) {
    filter.expense_date = {};
    if (startDate) (filter.expense_date as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate) (filter.expense_date as Record<string, unknown>).$lte = new Date(endDate);
  }

  const costs = await OverheadCost.find(filter).lean();

  const totalCost = costs.reduce((sum, c) => sum + (c.amount ?? 0), 0);

  // By category
  const byCategory: Record<string, number> = {};
  costs.forEach((c) => {
    byCategory[c.category] = (byCategory[c.category] ?? 0) + (c.amount ?? 0);
  });

  return {
    total_cost: totalCost,
    by_category: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
    count: costs.length,
  };
}

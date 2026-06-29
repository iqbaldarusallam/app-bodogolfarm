/* eslint-disable @typescript-eslint/no-explicit-any */
const mockQuarantineFindById = jest.fn();
const mockQuarantineCreate = jest.fn();
const mockQuarantineFindByIdAndDelete = jest.fn();
const mockLivestockFindById = jest.fn();
const mockLivestockFindByIdAndUpdate = jest.fn();
const mockIncrementOccupancy = jest.fn();
const mockDecrementOccupancy = jest.fn();
const mockAssertHasCapacity = jest.fn();
const mockGetPenById = jest.fn();
const mockTransitionTo = jest.fn();

jest.mock('../../../models/quarantine-record.model', () => ({
  QuarantineRecord: {
    findById: mockQuarantineFindById,
    create: mockQuarantineCreate,
    findByIdAndDelete: mockQuarantineFindByIdAndDelete,
  },
}));

jest.mock('../../../models/livestock.model', () => ({
  Livestock: {
    findById: mockLivestockFindById,
    findByIdAndUpdate: mockLivestockFindByIdAndUpdate,
  },
}));

jest.mock('../../pens/pens.service', () => ({
  incrementOccupancy: mockIncrementOccupancy,
  decrementOccupancy: mockDecrementOccupancy,
  assertHasCapacity: mockAssertHasCapacity,
  getById: mockGetPenById,
}));

jest.mock('../../status/status.service', () => ({
  transitionTo: mockTransitionTo,
}));

import { create, clearance, remove } from '../quarantine.service';

function populatedQuery(result: any) {
  const query: any = {
    populate: jest.fn(() => query),
    then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

describe('Quarantine Service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates active quarantine, validates quarantine pen, moves pen occupancy, and transitions livestock status', async () => {
    mockLivestockFindById.mockResolvedValue({
      farm_id: { toString: () => 'farm1' },
      current_pen_id: { toString: () => 'pen-old' },
    });
    mockGetPenById.mockResolvedValue({ pen_type: 'quarantine' });
    mockAssertHasCapacity.mockResolvedValue(undefined);
    mockTransitionTo.mockResolvedValue(undefined);
    mockDecrementOccupancy.mockResolvedValue(undefined);
    mockIncrementOccupancy.mockResolvedValue(undefined);
    mockLivestockFindByIdAndUpdate.mockResolvedValue(undefined);
    mockQuarantineCreate.mockImplementation((data: any) => Promise.resolve(data));

    await create({
      livestock_id: 'l1',
      health_record_id: 'h1',
      quarantine_pen_id: 'pen-q',
      start_date: new Date('2026-06-20'),
      expected_duration_days: 14,
      reason: 'Gejala klinis',
      disease_suspected: 'PMK',
    } as any, 'u1');

    expect(mockGetPenById).toHaveBeenCalledWith('pen-q', 'farm1');
    expect(mockAssertHasCapacity).toHaveBeenCalledWith('pen-q', 'farm1');
    expect(mockTransitionTo).toHaveBeenCalledWith('l1', 'quarantine', 'u1', {
      reason: 'Karantina: PMK — Gejala klinis',
      changed_date: new Date('2026-06-20'),
      farmId: 'farm1',
    });
    expect(mockDecrementOccupancy).toHaveBeenCalledWith('pen-old');
    expect(mockIncrementOccupancy).toHaveBeenCalledWith('pen-q');
    expect(mockLivestockFindByIdAndUpdate).toHaveBeenCalledWith('l1', {
      current_pen_id: 'pen-q',
    });
    expect(mockQuarantineCreate).toHaveBeenCalledWith(expect.objectContaining({
      original_pen_id: expect.any(Object),
      status: 'active',
    }));
  });

  it('throws 404 when creating quarantine for missing livestock', async () => {
    mockLivestockFindById.mockResolvedValue(null);

    await expect(create({
      livestock_id: 'missing',
      health_record_id: 'h1',
      quarantine_pen_id: 'pen-q',
      start_date: new Date('2026-06-20'),
      expected_duration_days: 14,
      reason: 'Gejala klinis',
      disease_suspected: 'PMK',
    } as any, 'u1')).rejects.toThrow('Ternak tidak ditemukan');
  });

  it('throws 400 when quarantine pen is not quarantine type', async () => {
    mockLivestockFindById.mockResolvedValue({
      farm_id: { toString: () => 'farm1' },
      current_pen_id: { toString: () => 'pen-old' },
    });
    mockGetPenById.mockResolvedValue({ pen_type: 'regular' });

    await expect(create({
      livestock_id: 'l1',
      health_record_id: 'h1',
      quarantine_pen_id: 'pen-q',
      start_date: new Date('2026-06-20'),
      expected_duration_days: 14,
      reason: 'Gejala klinis',
      disease_suspected: 'PMK',
    } as any, 'u1')).rejects.toThrow('Kandang yang dipilih bukan kandang karantina');
  });

  it('clears negative quarantine and restores original pen occupancy', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const record: any = {
      livestock_id: { farm_id: { toString: () => 'farm1' }, toString: () => 'l1' },
      quarantine_pen_id: { toString: () => 'pen-q' },
      original_pen_id: { _id: { toString: () => 'pen-old' } },
      status: 'active',
      save: mockSave,
    };
    mockQuarantineFindById.mockReturnValue(populatedQuery(record));
    mockTransitionTo.mockResolvedValue(undefined);
    mockDecrementOccupancy.mockResolvedValue(undefined);
    mockLivestockFindByIdAndUpdate.mockResolvedValue(undefined);
    mockIncrementOccupancy.mockResolvedValue(undefined);

    const result = await clearance('q1', {
      clearance_test_result: 'negative' as any,
      clearance_date: new Date('2026-06-25'),
      notes: 'Sehat',
    }, 'u1', 'farm1');

    expect(result.status).toBe('cleared');
    expect(mockTransitionTo).toHaveBeenCalledWith('l1', 'active', 'u1', {
      reason: 'Clearance negatif — ternak dinyatakan sehat',
      changed_date: new Date('2026-06-25'),
      farmId: 'farm1',
    });
    expect(mockDecrementOccupancy).toHaveBeenCalledWith('pen-q');
    expect(mockLivestockFindByIdAndUpdate).toHaveBeenCalledWith(record.livestock_id, {
      current_pen_id: 'pen-old',
    });
    expect(mockIncrementOccupancy).toHaveBeenCalledWith('pen-old');
    expect(mockSave).toHaveBeenCalled();
  });

  it('keeps quarantine active on positive clearance result', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const record: any = {
      livestock_id: { farm_id: { toString: () => 'farm1' }, toString: () => 'l1' },
      quarantine_pen_id: { toString: () => 'pen-q' },
      original_pen_id: { _id: { toString: () => 'pen-old' } },
      status: 'active',
      save: mockSave,
    };
    mockQuarantineFindById.mockReturnValue(populatedQuery(record));

    const result = await clearance('q1', {
      clearance_test_result: 'positive' as any,
      clearance_date: new Date('2026-06-25'),
      notes: 'Masih sakit',
    }, 'u1', 'farm1');

    expect(result.status).toBe('active');
    expect(mockSave).toHaveBeenCalled();
    expect(mockTransitionTo).not.toHaveBeenCalled();
    expect(mockDecrementOccupancy).not.toHaveBeenCalled();
  });

  it('blocks removing quarantine records from another farm', async () => {
    mockQuarantineFindById.mockReturnValue(populatedQuery({
      livestock_id: { farm_id: { toString: () => 'other-farm' } },
    }));

    await expect(remove('q1', 'farm1')).rejects.toThrow('Catatan karantina tidak ditemukan di farm ini');
    expect(mockQuarantineFindByIdAndDelete).not.toHaveBeenCalled();
  });
});

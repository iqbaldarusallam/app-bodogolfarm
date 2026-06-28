/* eslint-disable @typescript-eslint/no-explicit-any */
const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockCountDocuments = jest.fn();
const mockCreateStatusHistory = jest.fn();
const mockIncrementOccupancy = jest.fn();
const mockDecrementOccupancy = jest.fn();

jest.mock('../../../models/livestock.model', () => ({
  Livestock: {
    find: mockFind,
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
    countDocuments: mockCountDocuments,
  },
}));

jest.mock('../../../models/status-history.model', () => ({
  StatusHistory: { create: mockCreateStatusHistory },
}));

jest.mock('../../pens/pens.service', () => ({
  incrementOccupancy: mockIncrementOccupancy,
  decrementOccupancy: mockDecrementOccupancy,
}));

import { getAll, getById, update, remove } from '../livestock.service';

function populatedQuery(result: any) {
  const query: any = {
    populate: jest.fn(() => query),
    then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

function listQuery(result: any[]) {
  const query: any = {
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => Promise.resolve(result)),
  };
  return query;
}

describe('Livestock Service — farm scoping', () => {
  beforeEach(() => jest.clearAllMocks());

  it('filters list queries by farm_id', async () => {
    const rows = [{ _id: 'l1', farm_id: 'farm1' }];
    const query = listQuery(rows);
    mockFind.mockReturnValue(query);
    mockCountDocuments.mockResolvedValue(1);

    const result = await getAll('farm1', {
      page: 1,
      limit: 20,
      sort: 'created_at',
      order: 'desc',
    } as any);

    expect(mockFind).toHaveBeenCalledWith({ farm_id: 'farm1' });
    expect(mockCountDocuments).toHaveBeenCalledWith({ farm_id: 'farm1' });
    expect(result.data).toBe(rows);
    expect(result.pagination.total).toBe(1);
  });

  it('returns livestock detail when document belongs to farm', async () => {
    const livestock = { _id: 'l1', farm_id: { toString: () => 'farm1' } };
    mockFindById.mockReturnValue(populatedQuery(livestock));

    await expect(getById('l1', 'farm1')).resolves.toBe(livestock);
  });

  it('blocks livestock detail from another farm', async () => {
    mockFindById.mockReturnValue(populatedQuery({
      _id: 'l1',
      farm_id: { toString: () => 'other-farm' },
    }));

    await expect(getById('l1', 'farm1')).rejects.toThrow('Ternak tidak ditemukan di farm ini');
  });

  it('blocks updating livestock from another farm', async () => {
    mockFindById.mockResolvedValue({
      _id: 'l1',
      farm_id: { toString: () => 'other-farm' },
      current_status: 'active',
    });

    await expect(update('l1', { name: 'Bukan Farm Ini' } as any, 'farm1'))
      .rejects.toThrow('Ternak tidak ditemukan di farm ini');
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(mockCreateStatusHistory).not.toHaveBeenCalled();
  });

  it('blocks deleting livestock from another farm', async () => {
    mockFindById.mockResolvedValue({
      _id: 'l1',
      farm_id: { toString: () => 'other-farm' },
    });

    await expect(remove('l1', 'farm1')).rejects.toThrow('Ternak tidak ditemukan di farm ini');
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled();
  });
});

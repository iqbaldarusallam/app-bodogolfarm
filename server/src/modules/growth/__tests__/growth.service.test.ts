/* eslint-disable @typescript-eslint/no-explicit-any */
const mockCreate = jest.fn();
const mockSort = jest.fn();
const mockFindOne = jest.fn(() => ({ sort: mockSort }));

jest.mock('../../../models/growth-record.model', () => ({
  GrowthRecord: { create: mockCreate, findOne: mockFindOne },
}));

import { create } from '../growth.service';

describe('Growth Service — ADG calculation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calculates ADG correctly between two weigh-ins', async () => {
    mockSort.mockResolvedValue({ weight_kg: 20, record_date: new Date('2026-06-01') });
    mockCreate.mockImplementation((data: any) => Promise.resolve(data));

    await create({
      livestock_id: 'l1',
      record_date: new Date('2026-06-11'),
      weight_kg: 22,
      bcs: 3,
    }, 'u1');

    const createdData = mockCreate.mock.calls[0][0];
    expect(createdData.adg_calculated).toBeCloseTo(0.2, 2);
  });

  it('returns undefined ADG for first record', async () => {
    mockSort.mockResolvedValue(null);
    mockCreate.mockImplementation((data: any) => Promise.resolve(data));

    await create({
      livestock_id: 'l1',
      record_date: new Date('2026-06-01'),
      weight_kg: 20,
      bcs: 3,
    }, 'u1');

    const createdData = mockCreate.mock.calls[0][0];
    expect(createdData.adg_calculated).toBeUndefined();
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSave = jest.fn().mockResolvedValue(true);
const mockFindById = jest.fn();
const mockCreate = jest.fn();

jest.mock('../../../models/livestock.model', () => ({
  Livestock: { findById: mockFindById },
}));
jest.mock('../../../models/status-history.model', () => ({
  StatusHistory: { create: mockCreate },
}));
jest.mock('../../../models/medication-log.model', () => ({
  MedicationLog: { findOne: jest.fn().mockResolvedValue(null) },
}));

import { transitionTo } from '../status.service';

describe('Status Service — transitionTo', () => {
  beforeEach(() => jest.clearAllMocks());

  function mockLivestock(status: string) {
    const doc = { _id: 'l1', current_status: status, save: mockSave };
    mockFindById.mockResolvedValue(doc);
    return doc;
  }

  it('allows active → sick', async () => {
    mockLivestock('active');
    await transitionTo('l1', 'sick' as any, 'u1', { reason: 'Sakit' });
    expect(mockSave).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();
  });

  it('allows active → quarantine', async () => {
    mockLivestock('active');
    await transitionTo('l1', 'quarantine' as any, 'u1', { reason: 'Karantina' });
    expect(mockSave).toHaveBeenCalled();
  });

  it('allows active → sold with sale_price', async () => {
    mockLivestock('active');
    await transitionTo('l1', 'sold' as any, 'u1', { reason: 'Jual', sale_price: 500000 });
    expect(mockSave).toHaveBeenCalled();
  });

  it('blocks sold → active', async () => {
    mockLivestock('sold');
    await expect(
      transitionTo('l1', 'active' as any, 'u1', { reason: 'Kembali' }),
    ).rejects.toThrow('tidak diizinkan');
  });

  it('blocks dead → anything', async () => {
    mockLivestock('dead');
    await expect(
      transitionTo('l1', 'active' as any, 'u1', { reason: 'Hidup kembali' }),
    ).rejects.toThrow('tidak diizinkan');
  });

  it('requires sale_price for sold status', async () => {
    mockLivestock('active');
    await expect(
      transitionTo('l1', 'sold' as any, 'u1', { reason: 'Jual' }),
    ).rejects.toThrow('Harga jual wajib diisi');
  });

  it('throws 404 for missing livestock', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(
      transitionTo('missing', 'active' as any, 'u1', { reason: 'test' }),
    ).rejects.toThrow('Ternak tidak ditemukan');
  });
});

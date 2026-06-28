/* eslint-disable @typescript-eslint/no-explicit-any */
const mockCreate = jest.fn();

jest.mock('../../../models/medication-log.model', () => ({
  MedicationLog: { create: mockCreate, find: jest.fn(), findById: jest.fn() },
}));
jest.mock('../../../models/livestock.model', () => ({
  Livestock: { find: jest.fn().mockReturnValue({ distinct: jest.fn().mockResolvedValue([]) }) },
}));

import { create } from '../medication.service';

describe('Medication Service — withdrawal_end_date', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calculates withdrawal_end_date from start_date + period_days', async () => {
    mockCreate.mockImplementation((data: any) => Promise.resolve(data));

    await create({
      livestock_id: 'l1',
      health_record_id: 'h1',
      medication_type: 'treatment' as any,
      medicine_name: 'Amoxicillin',
      dosage: 5,
      dosage_unit: 'ml' as any,
      route: 'injeksi_IM' as any,
      frequency: '2x sehari',
      duration_days: 5,
      start_date: new Date('2026-06-20'),
      end_date: new Date('2026-06-25'),
      withdrawal_period_days: 10,
    }, 'u1');

    const createdData = mockCreate.mock.calls[0][0];
    const expected = new Date('2026-06-20');
    expected.setDate(expected.getDate() + 10);
    expect(createdData.withdrawal_end_date).toEqual(expected);
  });

  it('sets no withdrawal_end_date when period is 0', async () => {
    mockCreate.mockImplementation((data: any) => Promise.resolve(data));

    await create({
      livestock_id: 'l1',
      health_record_id: 'h1',
      medication_type: 'vitamin' as any,
      medicine_name: 'Vitamin B',
      dosage: 10,
      dosage_unit: 'ml' as any,
      route: 'oral' as any,
      frequency: '1x sehari',
      duration_days: 3,
      start_date: new Date('2026-06-20'),
      end_date: new Date('2026-06-23'),
    }, 'u1');

    const createdData = mockCreate.mock.calls[0][0];
    expect(createdData.withdrawal_end_date).toBeUndefined();
  });
});

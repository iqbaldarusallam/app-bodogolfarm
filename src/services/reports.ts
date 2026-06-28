// ─────────────────────────────────────────────────────────
// Reports API calls
// ─────────────────────────────────────────────────────────

import { api } from './api';

export async function getGrowthReport(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get('/reports/growth', { params });
  return data.data;
}

export async function getHealthReport(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get('/reports/health', { params });
  return data.data;
}

export async function getFeedingReport(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get('/reports/feeding', { params });
  return data.data;
}

export async function getMedicationReport(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get('/reports/medication', { params });
  return data.data;
}

export async function getStatusReport(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get('/reports/status', { params });
  return data.data;
}

export async function getWithdrawalAlert() {
  const { data } = await api.get('/reports/withdrawal-alert');
  return data.data;
}

export async function getVaccinationDue() {
  const { data } = await api.get('/reports/vaccination-due');
  return data.data;
}

export async function getReproductionReport(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const { data } = await api.get('/reports/reproduction', { params });
  return data.data;
}

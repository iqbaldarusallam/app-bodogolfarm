// ─────────────────────────────────────────────────────────
// Export service — generate CSV and share report data
// ─────────────────────────────────────────────────────────

import { Share } from 'react-native';

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  if (!data.length) return '';

  // Header row
  const header = columns.map((col) => col.label).join(',');

  // Data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        const strValue = value == null ? '' : String(value);
        // Escape commas and quotes
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(','),
  );

  return [header, ...rows].join('\n');
}

/**
 * Format date for export
 */
function formatDate(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Generate growth report CSV
 */
export function generateGrowthCSV(data: any[]): string {
  const columns = [
    { key: 'ear_tag', label: 'Ear Tag' },
    { key: 'weight_kg', label: 'Berat (kg)' },
    { key: 'bcs', label: 'BCS' },
    { key: 'adg', label: 'ADG (g/hari)' },
    { key: 'record_date', label: 'Tanggal' },
  ];

  const rows = data.map((rec) => ({
    ear_tag: rec.livestock_id?.ear_tag ?? '-',
    weight_kg: rec.weight_kg,
    bcs: rec.bcs ?? '-',
    adg: rec.adg_calculated != null ? Math.round(rec.adg_calculated) : '-',
    record_date: formatDate(rec.record_date),
  }));

  return arrayToCSV(rows, columns);
}

/**
 * Generate health report CSV
 */
export function generateHealthCSV(data: any[]): string {
  const columns = [
    { key: 'ear_tag', label: 'Ear Tag' },
    { key: 'chief_complaint', label: 'Keluhan' },
    { key: 'diagnosis', label: 'Diagnosa' },
    { key: 'body_temp', label: 'Suhu (°C)' },
    { key: 'is_infectious', label: 'Menular' },
    { key: 'record_date', label: 'Tanggal' },
  ];

  const rows = data.map((rec) => ({
    ear_tag: rec.livestock_id?.ear_tag ?? '-',
    chief_complaint: rec.chief_complaint ?? '-',
    diagnosis: rec.diagnosis ?? '-',
    body_temp: rec.body_temp_celsius ?? '-',
    is_infectious: rec.is_infectious ? 'Ya' : 'Tidak',
    record_date: formatDate(rec.record_date),
  }));

  return arrayToCSV(rows, columns);
}

/**
 * Generate feeding report CSV
 */
export function generateFeedingCSV(data: any[]): string {
  const columns = [
    { key: 'ear_tag', label: 'Ear Tag' },
    { key: 'feed_name', label: 'Jenis Pakan' },
    { key: 'amount_kg', label: 'Jumlah (kg)' },
    { key: 'feeding_time', label: 'Waktu' },
    { key: 'appetite', label: 'Nafsu Makan' },
    { key: 'feed_date', label: 'Tanggal' },
  ];

  const rows = data.map((rec) => ({
    ear_tag: rec.livestock_id?.ear_tag ?? '-',
    feed_name: rec.feed_master_id?.feed_name ?? '-',
    amount_kg: rec.amount_given_kg,
    feeding_time: rec.feeding_time ?? '-',
    appetite: rec.appetite_response ?? '-',
    feed_date: formatDate(rec.feed_date),
  }));

  return arrayToCSV(rows, columns);
}

/**
 * Generate medication report CSV
 */
export function generateMedicationCSV(data: any[]): string {
  const columns = [
    { key: 'ear_tag', label: 'Ear Tag' },
    { key: 'medicine_name', label: 'Obat' },
    { key: 'dosage', label: 'Dosis' },
    { key: 'route', label: 'Rute' },
    { key: 'withdrawal_days', label: 'Withdrawal (hari)' },
    { key: 'withdrawal_end', label: 'Aman Jual' },
  ];

  const rows = data.map((rec) => ({
    ear_tag: rec.livestock_id?.ear_tag ?? '-',
    medicine_name: rec.medicine_name ?? '-',
    dosage: `${rec.dosage} ${rec.dosage_unit}`,
    route: rec.route ?? '-',
    withdrawal_days: rec.withdrawal_period_days ?? 0,
    withdrawal_end: formatDate(rec.withdrawal_end_date),
  }));

  return arrayToCSV(rows, columns);
}

/**
 * Generate status report CSV
 */
export function generateStatusCSV(data: any[]): string {
  const columns = [
    { key: 'ear_tag', label: 'Ear Tag' },
    { key: 'status_from', label: 'Status Asal' },
    { key: 'status_to', label: 'Status Tujuan' },
    { key: 'reason', label: 'Alasan' },
    { key: 'changed_date', label: 'Tanggal' },
  ];

  const rows = data.map((rec) => ({
    ear_tag: rec.livestock_id?.ear_tag ?? '-',
    status_from: rec.status_from ?? '-',
    status_to: rec.status_to ?? '-',
    reason: rec.reason ?? '-',
    changed_date: formatDate(rec.changed_date),
  }));

  return arrayToCSV(rows, columns);
}

/**
 * Generate reproduction report CSV
 */
export function generateReproductionCSV(data: any[]): string {
  const columns = [
    { key: 'ear_tag', label: 'Ear Tag' },
    { key: 'event_type', label: 'Jenis Kejadian' },
    { key: 'mating_type', label: 'Metode Kawin' },
    { key: 'offspring_count', label: 'Jumlah Anak' },
    { key: 'event_date', label: 'Tanggal' },
  ];

  const rows = data.map((rec) => ({
    ear_tag: rec.livestock_id?.ear_tag ?? '-',
    event_type: rec.event_type ?? '-',
    mating_type: rec.mating_type ?? '-',
    offspring_count: rec.offspring_count ?? '-',
    event_date: formatDate(rec.event_date),
  }));

  return arrayToCSV(rows, columns);
}

/**
 * Share content via platform share sheet
 */
export async function shareCSV(filename: string, csvContent: string): Promise<boolean> {
  try {
    const result = await Share.share(
      {
        message: csvContent,
        title: filename,
      },
      {
        dialogTitle: `Bagikan ${filename}`,
      },
    );
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('[Export] Share failed:', error);
    return false;
  }
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(content);
    return true;
  } catch (error) {
    console.error('[Export] Copy failed:', error);
    return false;
  }
}

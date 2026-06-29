// ─────────────────────────────────────────────────────────
// Report Detail Modal — universal screen for all report types
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  useGrowthReport,
  useHealthReport,
  useFeedingReport,
  useMedicationReport,
  useStatusReport,
  useWithdrawalAlert,
  useVaccinationDue,
  useReproductionReport,
} from '@/hooks/useReports';
import {
  generateGrowthCSV,
  generateHealthCSV,
  generateFeedingCSV,
  generateMedicationCSV,
  generateStatusCSV,
  generateReproductionCSV,
  shareCSV,
  copyToClipboard,
} from '@/services/export';

function formatDate(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Growth Report ──
function GrowthReportView({ data }: { data: any[] }) {
  if (!data?.length) return <EmptyState icon="chart-line" label="Tidak ada data pertumbuhan" />;
  return (
    <View className="gap-2">
      {data.map((rec: any) => (
        <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          {rec.livestock_id?.photo_url ? (
            <Image
              source={{ uri: rec.livestock_id.photo_url }}
              className="h-10 w-10 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-light">
              <MaterialCommunityIcons name="paw" size={18} color="#0F5238" />
            </View>
          )}
          <View className="flex-1">
            <Text className="font-headline text-headline-sm font-semibold text-on-surface">
              {rec.livestock_id?.name ?? rec.livestock_id?.ear_tag ?? '-'}
            </Text>
            <Text className="text-caption text-on-surface-variant">
              #{rec.livestock_id?.ear_tag} · {rec.weight_kg} kg · BCS: {rec.bcs}/5
            </Text>
            {rec.adg_calculated != null && (
              <Text className={`text-caption font-semibold ${rec.adg_calculated >= 0 ? 'text-status-active' : 'text-status-quarantine'}`}>
                ADG: {rec.adg_calculated >= 0 ? '+' : ''}{Math.round(rec.adg_calculated)}g/hari
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Health Report ──
function HealthReportView({ data }: { data: any[] }) {
  if (!data?.length) return <EmptyState icon="medical-bag" label="Tidak ada data kesehatan" />;
  return (
    <View className="gap-2">
      {data.map((rec: any) => (
        <View key={rec._id} className="gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF3E0]">
              <MaterialCommunityIcons name="medical-bag" size={20} color="#F57C00" />
            </View>
            <View className="flex-1">
              <Text className="font-headline text-headline-sm font-semibold text-on-surface">{rec.chief_complaint}</Text>
              <Text className="text-caption text-on-surface-variant">
                {rec.livestock_id?.ear_tag} · {formatDate(rec.record_date)}
              </Text>
            </View>
            {rec.is_infectious && (
              <View className="rounded-full bg-status-quarantine/10 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-status-quarantine">MENULAR</Text>
              </View>
            )}
          </View>
          {rec.diagnosis && <Text className="text-body-md text-on-surface">Diagnosa: {rec.diagnosis}</Text>}
          {rec.body_temp_celsius && (
            <Text className={`text-caption font-semibold ${rec.body_temp_celsius > 40 ? 'text-status-quarantine' : 'text-on-surface-variant'}`}>
              Suhu: {rec.body_temp_celsius}°C
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Feeding Report ──
function FeedingReportView({ data }: { data: any[] }) {
  if (!data?.length) return <EmptyState icon="food" label="Tidak ada data pakan" />;
  return (
    <View className="gap-2">
      {data.slice(0, 30).map((rec: any) => (
        <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E1]">
            <MaterialCommunityIcons name="food" size={20} color="#F57C00" />
          </View>
          <View className="flex-1">
            <Text className="font-headline text-headline-sm font-semibold text-on-surface">
              {rec.livestock_id?.ear_tag} — {rec.amount_given_kg} kg
            </Text>
            <Text className="text-caption text-on-surface-variant">
              {formatDate(rec.feed_date)} · {rec.feeding_time} · {rec.feed_master_id?.feed_name ?? 'Pakan'}
            </Text>
          </View>
          <View className="rounded-full bg-surface-container px-2 py-0.5">
            <Text className="text-[10px] font-semibold text-on-surface-variant">{rec.appetite_response}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Medication Report ──
function MedicationReportView({ data }: { data: any[] }) {
  if (!data?.length) return <EmptyState icon="pill" label="Tidak ada data pengobatan" />;
  return (
    <View className="gap-2">
      {data.map((rec: any) => (
        <View key={rec._id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E1]">
              <MaterialCommunityIcons name="pill" size={20} color="#F4A261" />
            </View>
            <View className="flex-1">
              <Text className="font-headline text-headline-sm font-semibold text-on-surface">{rec.medicine_name}</Text>
              <Text className="text-caption text-on-surface-variant">
                {rec.livestock_id?.ear_tag} · {rec.dosage} {rec.dosage_unit} · {rec.route}
              </Text>
            </View>
          </View>
          {rec.withdrawal_period_days > 0 && (
            <View className="mt-2 rounded-lg border-l-4 border-status-quarantine bg-error-container/20 px-3 py-2">
              <Text className="text-caption font-semibold text-status-quarantine">
                Withdrawal: {rec.withdrawal_period_days} hari → Aman: {formatDate(rec.withdrawal_end_date)}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Withdrawal Alert Report ──
function WithdrawalAlertView({ data }: { data: any[] }) {
  if (!data?.length) return (
    <View className="items-center rounded-xl border border-status-active bg-success-light p-6">
      <MaterialCommunityIcons name="check-circle" size={48} color="#2E7D32" />
      <Text className="mt-3 font-headline text-headline-md font-bold text-success">Semua Aman</Text>
      <Text className="mt-1 text-center text-body-md text-on-surface-variant">
        Tidak ada hewan dalam masa henti obat saat ini
      </Text>
    </View>
  );

  return (
    <View className="gap-3">
      <View className="rounded-xl border border-status-quarantine bg-[#FDECEA] p-4">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons name="alert" size={24} color="#D32F2F" />
          <Text className="flex-1 font-headline text-headline-sm font-bold text-status-quarantine">
            {data.length} hewan TIDAK BOLEH dijual atau dipotong
          </Text>
        </View>
      </View>
      {data.map((rec: any) => (
        <View key={rec._id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <Text className="font-headline text-headline-md font-bold text-on-surface">
            #{rec.livestock_id?.ear_tag} — {rec.livestock_id?.name ?? rec.livestock_id?.species}
          </Text>
          <Text className="mt-1 text-body-md text-on-surface-variant">{rec.medicine_name} {rec.dosage}{rec.dosage_unit} {rec.route}</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <MaterialCommunityIcons name="clock-alert" size={16} color="#D32F2F" />
            <Text className="text-body-md font-semibold text-status-quarantine">
              Aman jual: {formatDate(rec.withdrawal_end_date)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Vaccination Due Report ──
function VaccinationDueView({ data }: { data: any[] }) {
  if (!data?.length) return (
    <View className="items-center rounded-xl border border-status-active bg-success-light p-6">
      <MaterialCommunityIcons name="check-circle" size={48} color="#2E7D32" />
      <Text className="mt-3 font-headline text-headline-md font-bold text-success">Semua Terjadwal</Text>
      <Text className="mt-1 text-center text-body-md text-on-surface-variant">
        Tidak ada vaksinasi jatuh tempo dalam 30 hari ke depan
      </Text>
    </View>
  );

  return (
    <View className="gap-2">
      {data.map((rec: any) => (
        <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD]">
            <MaterialCommunityIcons name="needle" size={20} color="#1565C0" />
          </View>
          <View className="flex-1">
            <Text className="font-headline text-headline-sm font-semibold text-on-surface">
              {rec.livestock_id?.ear_tag} — {rec.vaccine_name}
            </Text>
            <Text className="text-caption text-on-surface-variant">{rec.disease_target}</Text>
            <Text className="text-caption font-semibold text-info">Booster: {formatDate(rec.booster_due_date)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Reproduction Report ──
function ReproductionReportView({ data }: { data: any[] }) {
  if (!data?.length) return <EmptyState icon="baby-carriage" label="Tidak ada data reproduksi" />;
  return (
    <View className="gap-2">
      {data.map((rec: any) => (
        <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-50">
            <MaterialCommunityIcons name="baby-carriage" size={20} color="#9333EA" />
          </View>
          <View className="flex-1">
            <Text className="font-headline text-headline-sm font-semibold text-on-surface capitalize">{rec.event_type}</Text>
            <Text className="text-caption text-on-surface-variant">
              {rec.livestock_id?.ear_tag} · {formatDate(rec.event_date)}
            </Text>
            {rec.mating_type && <Text className="text-caption text-on-surface-variant">Metode: {rec.mating_type}</Text>}
            {rec.offspring_count && <Text className="text-caption text-on-surface-variant">Anak: {rec.offspring_count}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Status Report ──
function StatusReportView({ data }: { data: any[] }) {
  if (!data?.length) return <EmptyState icon="flag-outline" label="Tidak ada riwayat perubahan status" />;

  const getStatusColor = (status: string): string => {
    const map: Record<string, string> = {
      active: '#52B788',
      sick: '#F4A261',
      quarantine: '#E63946',
      sold: '#6D6875',
      dead: '#495057',
      transferred: '#3B82F6',
    };
    return map[status] ?? '#707973';
  };

  const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      active: 'Aktif',
      sick: 'Sakit',
      quarantine: 'Karantina',
      sold: 'Terjual',
      dead: 'Mati',
      transferred: 'Dipindah',
    };
    return map[status] ?? status;
  };

  return (
    <View className="gap-2">
      {data.map((rec: any) => (
        <View key={rec._id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
              <MaterialCommunityIcons name="flag-outline" size={20} color="#404943" />
            </View>
            <View className="flex-1">
              <Text className="font-headline text-headline-sm font-semibold text-on-surface">
                {rec.livestock_id?.ear_tag} — {rec.livestock_id?.name ?? ''}
              </Text>
              <View className="mt-1 flex-row items-center gap-2">
                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${getStatusColor(rec.status_from)}15` }}>
                  <Text className="text-[10px] font-bold" style={{ color: getStatusColor(rec.status_from) }}>
                    {getStatusLabel(rec.status_from)}
                  </Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={12} color="#707973" />
                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${getStatusColor(rec.status_to)}15` }}>
                  <Text className="text-[10px] font-bold" style={{ color: getStatusColor(rec.status_to) }}>
                    {getStatusLabel(rec.status_to)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {rec.reason && <Text className="mt-2 text-caption text-on-surface-variant">{rec.reason}</Text>}
          <Text className="mt-1 text-caption text-outline">{formatDate(rec.changed_date)}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Empty State ──
function EmptyState({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="items-center py-16">
      <MaterialCommunityIcons name={icon as any} size={48} color="#D0D5D2" />
      <Text className="mt-3 font-headline text-body-lg font-semibold text-on-surface-variant">{label}</Text>
    </View>
  );
}

// ── Main Screen ──

const REPORT_CONFIG: Record<string, { title: string; icon: string; color: string }> = {
  growth: { title: 'Pertumbuhan & ADG', icon: 'chart-line', color: '#0F5238' },
  health: { title: 'Rekap Kesehatan', icon: 'medical-bag', color: '#1565C0' },
  feeding: { title: 'Biaya Pakan & FCR', icon: 'cash-multiple', color: '#F57C00' },
  medication: { title: 'Riwayat Pengobatan', icon: 'pill', color: '#F4A261' },
  status: { title: 'Riwayat Status', icon: 'flag-outline', color: '#2E7D32' },
  'withdrawal-alert': { title: 'Withdrawal Alert', icon: 'alert-circle', color: '#D32F2F' },
  'vaccination-due': { title: 'Vaksinasi Jatuh Tempo', icon: 'needle', color: '#0D9488' },
  reproduction: { title: 'Reproduksi', icon: 'baby-carriage', color: '#9333EA' },
};

export default function ReportDetailScreen() {
  const router = useRouter();
  const { type, startDate, endDate } = useLocalSearchParams<{ type: string; startDate?: string; endDate?: string }>();

  const config = REPORT_CONFIG[type ?? ''] ?? { title: 'Laporan', icon: 'chart-bar', color: '#404943' };

  // Fetch data based on report type — pass period filters
  const growthQuery = useGrowthReport(startDate, endDate);
  const healthQuery = useHealthReport(startDate, endDate);
  const feedingQuery = useFeedingReport(startDate, endDate);
  const medicationQuery = useMedicationReport(startDate, endDate);
  const statusQuery = useStatusReport(startDate, endDate);
  const withdrawalQuery = useWithdrawalAlert();
  const vaccinationQuery = useVaccinationDue();
  const reproductionQuery = useReproductionReport(startDate, endDate);

  const queryMap: Record<string, { data: any; isLoading: boolean }> = {
    growth: growthQuery,
    health: healthQuery,
    feeding: feedingQuery,
    medication: medicationQuery,
    status: statusQuery,
    'withdrawal-alert': withdrawalQuery,
    'vaccination-due': vaccinationQuery,
    reproduction: reproductionQuery,
  };

  const { data, isLoading } = queryMap[type ?? ''] ?? { data: null, isLoading: false };

  // ── Export handlers ──
  const generateCSV = useCallback((): string => {
    const reportData = data ?? [];
    switch (type) {
      case 'growth': return generateGrowthCSV(reportData);
      case 'health': return generateHealthCSV(reportData);
      case 'feeding': return generateFeedingCSV(reportData);
      case 'medication': return generateMedicationCSV(reportData);
      case 'status': return generateStatusCSV(reportData);
      case 'reproduction': return generateReproductionCSV(reportData);
      default: return '';
    }
  }, [type, data]);

  const handleExport = useCallback(async () => {
    if (!data?.length) {
      Alert.alert('Export', 'Tidak ada data untuk di-export');
      return;
    }

    const csv = generateCSV();
    if (!csv) {
      Alert.alert('Export', 'Format report ini belum didukung untuk export');
      return;
    }

    Alert.alert(
      'Export Laporan',
      'Pilih cara export:',
      [
        {
          text: 'Bagikan',
          onPress: async () => {
            const success = await shareCSV(`${config.title}.csv`, csv);
            if (!success) Alert.alert('Export', 'Gagal membagikan file');
          },
        },
        {
          text: 'Salin ke Clipboard',
          onPress: async () => {
            const success = await copyToClipboard(csv);
            Alert.alert('Export', success ? 'Berhasil disalin ke clipboard' : 'Gagal menyalin');
          },
        },
        { text: 'Batal', style: 'cancel' },
      ],
    );
  }, [data, generateCSV, config.title]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center bg-surface px-gutter py-sm shadow-sm">
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
        </Pressable>
        <Text className="flex-1 pr-4 text-center font-headline text-headline-md font-semibold text-on-surface">
          {config.title}
        </Text>
        {data?.length > 0 && (
          <Pressable
            onPress={handleExport}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary/10"
          >
            <MaterialCommunityIcons name="share-variant" size={20} color="#0F5238" />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={config.color} />
          <Text className="mt-3 text-body-md text-on-surface-variant">Memuat data laporan...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {type === 'growth' && <GrowthReportView data={data ?? []} />}
          {type === 'health' && <HealthReportView data={data ?? []} />}
          {type === 'feeding' && <FeedingReportView data={data ?? []} />}
          {type === 'medication' && <MedicationReportView data={data ?? []} />}
          {type === 'status' && <StatusReportView data={data ?? []} />}
          {type === 'withdrawal-alert' && <WithdrawalAlertView data={data ?? []} />}
          {type === 'vaccination-due' && <VaccinationDueView data={data ?? []} />}
          {type === 'reproduction' && <ReproductionReportView data={data ?? []} />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

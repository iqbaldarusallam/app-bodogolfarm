// ─────────────────────────────────────────────────────────
// Laporan & Analitik Screen — PRD Screen 14 spec
// All buttons wired to real report screens
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// 6 bulan terakhir, dinamis dari tanggal sekarang (terbaru di depan).
function generatePeriods(count = 6): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`);
  }
  return out;
}

const PERIOD_OPTIONS = generatePeriods();

const REPORT_CATEGORIES: {
  title: string;
  subtitle: string;
  icon: IconName;
  bg: string;
  color: string;
  type: string;
  isAlert?: boolean;
}[] = [
  { title: 'Pertumbuhan & ADG', subtitle: 'Grafik bobot dan performa harian', icon: 'chart-line', bg: 'bg-brand-light', color: '#0F5238', type: 'growth' },
  { title: 'Rekap Kesehatan', subtitle: 'Pemeriksaan, sakit, dan tindakan', icon: 'medical-bag', bg: 'bg-[#E3F2FD]', color: '#1565C0', type: 'health' },
  { title: 'Biaya Pakan & FCR', subtitle: 'Efisiensi biaya dan konversi pakan', icon: 'cash-multiple', bg: 'bg-[#FFF8E1]', color: '#F57C00', type: 'feeding' },
  { title: 'Reproduksi', subtitle: 'Kawin, bunting, dan kelahiran', icon: 'baby-carriage', bg: 'bg-purple-50', color: '#9333EA', type: 'reproduction' },
  { title: 'Status Vaksinasi', subtitle: 'Jadwal booster dan histori vaksin', icon: 'needle', bg: 'bg-teal-50', color: '#0D9488', type: 'vaccination-due' },
  { title: 'Withdrawal Alert', subtitle: 'Hewan dalam masa henti obat — TIDAK BOLEH DIJUAL', icon: 'alert-circle', bg: 'bg-[#FDECEA]', color: '#D32F2F', type: 'withdrawal-alert', isAlert: true },
  { title: 'Inventaris Kandang', subtitle: 'Populasi dan distribusi kandang', icon: 'warehouse', bg: 'bg-surface-muted', color: '#404943', type: 'pens' },
];

function ReportRow({
  item,
  onPress,
}: {
  item: (typeof REPORT_CATEGORIES)[number];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-md rounded-xl border p-md shadow-sm active:opacity-70 ${
        item.isAlert ? 'border-status-quarantine/30 bg-[#FFF5F5]' : 'border-outline-variant bg-surface-container-lowest'
      }`}
    >
      <View className={`h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
      </View>
      <View className="flex-1">
        <Text className={`font-headline text-headline-sm font-semibold ${item.isAlert ? 'text-status-quarantine' : 'text-on-surface'}`}>{item.title}</Text>
        <Text className="mt-0.5 font-caption text-caption text-on-surface-variant">{item.subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={item.isAlert ? '#E63946' : '#707973'} />
    </Pressable>
  );
}

export default function ReportsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[0]);
  const [showPeriodSheet, setShowPeriodSheet] = useState(false);

  const handleReportPress = (category: (typeof REPORT_CATEGORIES)[number]) => {
    if (category.type === 'pens') {
      router.push('/(modals)/manage-pens');
      return;
    }
    // Parse "Jun 2026" → startDate/endDate
    const parts = selectedPeriod.split(' ');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthIdx = monthNames.indexOf(parts[0] ?? '');
    const year = parseInt(parts[1] ?? '2026');
    const startDate = `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, monthIdx + 1, 0).getDate();
    const endDate = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    router.push({
      pathname: '/(modals)/report-detail',
      params: { type: category.type, startDate, endDate },
    });
  };

  const handleExportPDF = () => {
    Alert.alert('Ekspor', `Laporan ${selectedPeriod} akan tersedia untuk diekspor di versi berikutnya.`, [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="font-headline text-headline-lg font-bold text-on-surface">
            Laporan & Analitik
          </Text>
        </View>

        {/* Period selector + Export */}
        <View className="mb-6 flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <Pressable onPress={() => setShowPeriodSheet(true)}>
            <Text className="font-caption text-caption font-semibold uppercase tracking-widest text-on-surface-variant">
              Periode
            </Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Text className="font-headline text-headline-sm font-semibold text-on-surface">{selectedPeriod}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#0F5238" />
            </View>
          </Pressable>
          <Pressable
            onPress={handleExportPDF}
            className="flex-row items-center gap-2 rounded-lg bg-primary-container px-md py-2.5 active:opacity-70"
          >
            <MaterialCommunityIcons name="download" size={18} color="#A8E7C5" />
            <Text className="font-label text-label-md font-semibold text-on-primary-container">Ekspor PDF</Text>
          </Pressable>
        </View>

        {/* Report categories */}
        <Text className="mb-3 font-label text-label-md font-semibold uppercase tracking-widest text-on-surface-variant">
          Kategori Laporan
        </Text>
        <View className="gap-2">
          {REPORT_CATEGORIES.map((category) => (
            <ReportRow
              key={category.title}
              item={category}
              onPress={() => handleReportPress(category)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Period BottomSheet */}
      <BottomSheet
        visible={showPeriodSheet}
        onClose={() => setShowPeriodSheet(false)}
        title="Pilih Periode"
      >
        <View className="gap-2">
          {PERIOD_OPTIONS.map((period) => (
            <Pressable
              key={period}
              onPress={() => { setSelectedPeriod(period); setShowPeriodSheet(false); }}
              className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                selectedPeriod === period
                  ? 'border-primary bg-primary/10'
                  : 'border-outline-variant bg-surface-container-lowest'
              }`}
            >
              <Text className={`text-body-md ${selectedPeriod === period ? 'font-semibold text-primary' : 'text-on-surface'}`}>
                {period}
              </Text>
              {selectedPeriod === period && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#0F5238" />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// Detail Ternak Screen — PRD Screen 4 spec
// ─────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  useLivestockDetail,
  useLivestockTimeline,
  useGrowthByLivestock,
  useFeedingByLivestock,
  useHealthByLivestock,
  useMedicationByLivestock,
  useVaccinationByLivestock,
  useReproductionByLivestock,
} from '@/hooks/useLivestock';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { FAB } from '@/components/ui/FAB';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { deleteLivestock } from '@/services/livestock';
import { usePermissions } from '@/lib/permissions';
import { WeightChart } from '@/components/ui/WeightChart';
import type { LivestockDetail, LivestockStatus, Species } from '@/types/livestock';

// ── Constants ──

const HEADER_IMAGE_HEIGHT = 200;
const COLLAPSED_HEADER_THRESHOLD = 120;

const SPECIES_ICON: Record<Species, string> = {
  sapi: 'cow',
  domba: 'sheep',
  kambing: 'paw',
  kerbau: 'cow',
};

const TABS = [
  { key: 'timeline', label: 'Timeline', icon: 'clock-outline' },
  { key: 'growth', label: 'Pertumbuhan', icon: 'chart-line' },
  { key: 'feeding', label: 'Pakan', icon: 'food' },
  { key: 'health', label: 'Kesehatan', icon: 'medical-bag' },
  { key: 'medication', label: 'Obat', icon: 'pill' },
  { key: 'vaccination', label: 'Vaksin', icon: 'needle' },
  { key: 'reproduction', label: 'Reproduksi', icon: 'baby-face-outline' },
  { key: 'status', label: 'Status', icon: 'flag-outline' },
];

const SPEED_DIAL_ITEMS = [
  { key: 'growth', label: 'Catat Penimbangan', icon: 'scale-bathroom' as const, color: '#52B788' },
  { key: 'feeding', label: 'Catat Pakan', icon: 'food' as const, color: '#F4A261' },
  { key: 'health', label: 'Catat Kesehatan', icon: 'medical-bag' as const, color: '#E63946' },
  { key: 'vaccination', label: 'Catat Vaksinasi', icon: 'needle' as const, color: '#3B82F6' },
  { key: 'reproduction', label: 'Catat Reproduksi', icon: 'baby-face-outline' as const, color: '#9B5DE5' },
  { key: 'status', label: 'Update Status', icon: 'flag-outline' as const, color: '#6D6875' },
];

// ── Helpers ──

function formatAge(age?: LivestockDetail['age']): string {
  if (!age) return '';
  if (age.years > 0) return `${age.years} th ${age.months > 0 ? `${age.months} bln` : ''}`.trim();
  if (age.months > 0) return `${age.months} bln`;
  return `${age.days} hari`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getPenCode(pen: LivestockDetail['current_pen_id']): string {
  if (!pen) return '';
  if (typeof pen === 'object' && 'pen_code' in pen) return pen.pen_code;
  return '';
}

function getStatusLabel(status: LivestockStatus): string {
  const map: Record<LivestockStatus, string> = {
    active: 'Aktif',
    sick: 'Sakit',
    quarantine: 'Karantina',
    sold: 'Terjual',
    dead: 'Mati',
    transferred: 'Dipindah',
  };
  return map[status] ?? status;
}

// ── Sub-components ──

function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5">
      <MaterialCommunityIcons name={icon as any} size={14} color="#404943" />
      <Text className="font-body text-body-sm text-on-surface-variant">{text}</Text>
    </View>
  );
}

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`shrink-0 flex-row items-center gap-1.5 border-b-2 px-4 py-3 ${
        active ? 'border-primary-700' : 'border-transparent'
      }`}
    >
      <MaterialCommunityIcons
        name={tab.icon as any}
        size={16}
        color={active ? '#2D6A4F' : '#707973'}
      />
      <Text
        className={`font-label text-label-md ${
          active ? 'font-bold text-primary-700' : 'font-medium text-on-surface-variant'
        }`}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

function EmptyTabContent({ icon, label }: { icon: string; label: string }) {
  return (
    <View className="items-center py-16">
      <MaterialCommunityIcons name={icon as any} size={48} color="#D0D5D2" />
      <Text className="mt-3 font-headline text-body-lg font-semibold text-on-surface-variant">
        Belum ada data
      </Text>
      <Text className="mt-1 font-body text-body-sm text-on-surface-variant">
        {label} belum dicatat untuk ternak ini
      </Text>
    </View>
  );
}

// ── Helpers ──

function formatTimelineDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Screen ──

export default function LivestockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: livestock, isLoading, isError } = useLivestockDetail(id ?? '');
  const { data: timeline = [] } = useLivestockTimeline(id ?? '');
  const { data: growthRecords } = useGrowthByLivestock(id ?? '');
  const { data: feedingRecords } = useFeedingByLivestock(id ?? '');
  const { data: healthRecords } = useHealthByLivestock(id ?? '');
  const { data: medicationRecords } = useMedicationByLivestock(id ?? '');
  const { data: vaccinationRecords } = useVaccinationByLivestock(id ?? '');
  const { data: reproductionRecords } = useReproductionByLivestock(id ?? '');

  const lastWeight = growthRecords && growthRecords.length > 0
    ? growthRecords[0].weight_kg
    : 0;

  const [activeTab, setActiveTab] = useState('timeline');
  const [fabOpen, setFabOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const queryClient = useQueryClient();
  const { canClearQuarantine, canDeleteLivestock } = usePermissions();

  const deleteMutation = useMutation({
    mutationFn: () => deleteLivestock(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Gagal menghapus data ternak.');
    },
  });

  const handleDelete = useCallback(() => {
    if (!livestock) return;
    Alert.alert(
      'Hapus Ternak',
      `Yakin ingin menghapus ${livestock.ear_tag} (${livestock.name ?? livestock.species})?\n\nData yang dihapus tidak dapat dikembalikan.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ],
    );
  }, [livestock, deleteMutation]);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const isCollapsed = useMemo(() => new Animated.Value(0), []);

  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: false,
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const c = y > COLLAPSED_HEADER_THRESHOLD;
        isCollapsed.setValue(c ? 1 : 0);
        setCollapsed(c); // React bail-out kalau nilainya sama
      },
    }),
    [scrollY, isCollapsed],
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSED_HEADER_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Bar collapsed: 0 (sembunyi) di atas → 1 (muncul) saat di-scroll melewati ambang.
  const appBarOpacity = scrollY.interpolate({
    inputRange: [COLLAPSED_HEADER_THRESHOLD * 0.6, COLLAPSED_HEADER_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageHeight = scrollY.interpolate({
    inputRange: [0, HEADER_IMAGE_HEIGHT],
    outputRange: [HEADER_IMAGE_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const handleFabItemPress = useCallback(
    (key: string) => {
      setFabOpen(false);
      if (!livestock) return;

      const routes: Record<string, { pathname: string; params: Record<string, string> }> = {
        growth: {
          pathname: '/(modals)/growth',
          params: { livestockId: livestock._id, earTag: livestock.ear_tag, lastWeight: String(lastWeight), status: livestock.current_status },
        },
        feeding: {
          pathname: '/(modals)/feeding',
          params: { livestockId: livestock._id, earTag: livestock.ear_tag, lastWeight: String(lastWeight) },
        },
        health: {
          pathname: '/(modals)/health',
          params: { livestockId: livestock._id, earTag: livestock.ear_tag, animalName: livestock.name ?? livestock.species },
        },
        vaccination: {
          pathname: '/(modals)/vaccination',
          params: { livestockId: livestock._id, earTag: livestock.ear_tag, animalName: livestock.name ?? livestock.species },
        },
        reproduction: {
          pathname: '/(modals)/reproduction',
          params: { livestockId: livestock._id, earTag: livestock.ear_tag },
        },
        status: {
          pathname: '/(modals)/update-status',
          params: { livestockId: livestock._id, earTag: livestock.ear_tag, animalName: livestock.name ?? livestock.species, currentStatus: livestock.current_status },
        },
      };

      const route = routes[key];
      if (route) router.push(route as any);
    },
    [livestock, lastWeight, router],
  );

  // ── Loading / Error states ──

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface" edges={['top']}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text className="mt-3 font-body text-body-md text-on-surface-variant">Memuat data ternak...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !livestock) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
        <View className="flex-row items-center gap-3 px-gutter py-sm">
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#404943" />
          </Pressable>
          <Text className="font-headline text-headline-md font-semibold text-on-surface">Detail Ternak</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#D0D5D2" />
          <Text className="mt-3 text-center font-headline text-body-lg font-semibold text-on-surface-variant">
            Ternak tidak ditemukan
          </Text>
          <Text className="mt-1 text-center font-body text-body-sm text-on-surface-variant">
            Data mungkin telah dihapus atau terjadi kesalahan koneksi
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 rounded-xl bg-primary-700 px-6 py-3"
          >
            <Text className="font-label text-label-md font-semibold text-white">Kembali</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const speciesIcon = SPECIES_ICON[livestock.species] ?? 'cow';
  const statusConfig = {
    active: { color: '#52B788' },
    sick: { color: '#F4A261' },
    quarantine: { color: '#E63946' },
    sold: { color: '#6D6875' },
    dead: { color: '#495057' },
    transferred: { color: '#3B82F6' },
  }[livestock.current_status] ?? { color: '#52B788' };

  const penCode = getPenCode(livestock.current_pen_id);
  const sexLabel = livestock.sex === 'male' ? 'Jantan' : 'Betina';
  const age = formatAge(livestock.age);

  const infoChips: { icon: string; text: string }[] = [
    { icon: livestock.sex === 'male' ? 'gender-male' : 'gender-female', text: sexLabel },
    ...(age ? [{ icon: 'calendar', text: age }] : []),
    ...(penCode ? [{ icon: 'home', text: penCode }] : []),
    { icon: 'tag', text: livestock.breed },
  ];

  return (
    <View className="flex-1 bg-surface">
      {/* ── Collapsed AppBar ── */}
      <Animated.View
        pointerEvents={collapsed ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          opacity: appBarOpacity,
        }}
      >
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center gap-3 bg-primary-700 px-gutter py-sm">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full">
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </Pressable>
            <View className="flex-1">
              <Text className="font-mono text-label-md font-bold text-white">#{livestock.ear_tag}</Text>
              <Text numberOfLines={1} className="font-body text-body-sm text-white/80">{livestock.name ?? livestock.species}</Text>
            </View>
            <StatusBadge status={livestock.current_status} />
            <Pressable
              onPress={() => setMenuOpen(true)}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/20"
            >
              <MaterialCommunityIcons name="dots-vertical" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── Photo Header ── */}
        <Animated.View style={{ height: imageHeight, overflow: 'hidden' }}>
          <View className="relative h-full w-full bg-surface-container-high">
            {livestock.photo_url ? (
              <Image
                source={{ uri: livestock.photo_url }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <MaterialCommunityIcons name={speciesIcon as any} size={80} color={statusConfig.color} />
              </View>
            )}

            {/* Gradient overlay */}
            <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Back button */}
            <View className="absolute left-4 top-12">
              <Pressable
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/30"
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Header info — overlay on image */}
            <Animated.View
              style={{ opacity: headerOpacity }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Text className="font-mono text-headline-sm font-bold text-white">#{livestock.ear_tag}</Text>
              <Text numberOfLines={1} className="mt-1 font-headline text-headline-lg font-semibold text-white">
                {livestock.name ?? livestock.species}
              </Text>
              <View className="mt-2 flex-row items-center gap-2">
                <View
                  className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ backgroundColor: `${statusConfig.color}30` }}
                >
                  <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                  <Text className="font-label text-label-md font-bold uppercase text-white">
                    {getStatusLabel(livestock.current_status)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* ── Info Chips ── */}
        <View className="border-b border-outline-variant bg-surface px-gutter py-3">
          <View className="flex-row flex-wrap gap-2">
            {infoChips.map((chip, i) => (
              <InfoChip key={i} icon={chip.icon} text={chip.text} />
            ))}
          </View>
        </View>

        {/* ── Tab Bar ── */}
        <View className="border-b border-outline-variant bg-surface">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map((tab) => (
              <TabItem
                key={tab.key}
                tab={tab}
                active={activeTab === tab.key}
                onPress={() => setActiveTab(tab.key)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Tab Content ── */}
        <View className="px-gutter pt-4">
          {activeTab === 'timeline' && (
            <View className="gap-1">
              <Text className="mb-3 font-headline text-headline-sm font-semibold text-on-surface">
                Aktivitas Terakhir
              </Text>
              {timeline.length === 0 ? (
                <View className="items-center py-8">
                  <MaterialCommunityIcons name="clock-outline" size={40} color="#D0D5D2" />
                  <Text className="mt-2 text-body-md text-on-surface-variant">Belum ada catatan</Text>
                </View>
              ) : (
                timeline.slice(0, 10).map((item, i) => (
                  <TimelineItem
                    key={item._id}
                    type={item.type as any}
                    title={item.title}
                    subtitle={item.summary}
                    date={formatTimelineDate(item.date)}
                    highlight={item.highlight}
                    isLast={i === Math.min(timeline.length, 10) - 1}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'growth' && (
            growthRecords && growthRecords.length > 0 ? (
              <View className="gap-3">
                <WeightChart
                  data={[...growthRecords]
                    .reverse()
                    .map((r) => ({ date: r.record_date, weight: r.weight_kg }))}
                />
                <Text className="mb-1 font-headline text-headline-sm font-semibold text-on-surface">Riwayat Penimbangan</Text>
                {growthRecords.map((rec) => (
                  <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-light">
                      <MaterialCommunityIcons name="scale-bathroom" size={20} color="#2D6A4F" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline text-headline-sm font-semibold text-on-surface">{rec.weight_kg} kg</Text>
                      <Text className="text-caption text-on-surface-variant">{formatDate(rec.record_date)} · BCS: {rec.bcs ?? '-'}/5</Text>
                      {rec.adg_calculated ? (
                        <Text className={`text-caption font-semibold ${rec.adg_calculated >= 0 ? 'text-status-active' : 'text-status-quarantine'}`}>
                          ADG: {rec.adg_calculated >= 0 ? '+' : ''}{Math.round(rec.adg_calculated)}g/hari
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyTabContent icon="chart-line" label="Data penimbangan" />
            )
          )}

          {activeTab === 'feeding' && (
            feedingRecords && feedingRecords.length > 0 ? (
              <View className="gap-3">
                <Text className="mb-1 font-headline text-headline-sm font-semibold text-on-surface">Riwayat Pakan</Text>
                {feedingRecords.slice(0, 10).map((rec) => (
                  <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E1]">
                      <MaterialCommunityIcons name="food" size={20} color="#F57C00" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline text-headline-sm font-semibold text-on-surface">{rec.amount_given_kg} kg</Text>
                      <Text className="text-caption text-on-surface-variant">{formatDate(rec.feed_date)} · {rec.feeding_time}</Text>
                    </View>
                    <View className="rounded-full bg-surface-container px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-on-surface-variant">{rec.appetite_response}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyTabContent icon="food" label="Data pakan" />
            )
          )}

          {activeTab === 'health' && (
            healthRecords && healthRecords.length > 0 ? (
              <View className="gap-3">
                <Text className="mb-1 font-headline text-headline-sm font-semibold text-on-surface">Riwayat Kesehatan</Text>
                {healthRecords.map((rec) => (
                  <View key={rec._id} className="gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                    <View className="flex-row items-center gap-2">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF3E0]">
                        <MaterialCommunityIcons name="medical-bag" size={20} color="#F57C00" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline text-headline-sm font-semibold text-on-surface">{rec.chief_complaint}</Text>
                        <Text className="text-caption text-on-surface-variant">{formatDate(rec.record_date)}</Text>
                      </View>
                      {rec.disease_category && (
                        <View className="rounded-full bg-surface-container px-2 py-0.5">
                          <Text className="text-[10px] font-semibold text-on-surface-variant">{rec.disease_category}</Text>
                        </View>
                      )}
                    </View>
                    {rec.symptoms && rec.symptoms.length > 0 && (
                      <View className="flex-row flex-wrap gap-1">
                        {rec.symptoms.map((s, i) => (
                          <View key={i} className="rounded-full bg-surface-container px-2 py-0.5">
                            <Text className="text-[10px] text-on-surface-variant">{s}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {rec.body_temp_celsius && (
                      <Text className={`text-caption font-semibold ${rec.body_temp_celsius > 40 ? 'text-status-quarantine' : 'text-on-surface-variant'}`}>
                        Suhu: {rec.body_temp_celsius}°C
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyTabContent icon="medical-bag" label="Data kesehatan" />
            )
          )}

          {activeTab === 'medication' && (
            medicationRecords && medicationRecords.length > 0 ? (
              <View className="gap-3">
                <Text className="mb-1 font-headline text-headline-sm font-semibold text-on-surface">Riwayat Pengobatan</Text>
                {medicationRecords.map((rec) => (
                  <View key={rec._id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                    <View className="flex-row items-center gap-2">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E1]">
                        <MaterialCommunityIcons name="pill" size={20} color="#F4A261" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline text-headline-sm font-semibold text-on-surface">{rec.medicine_name}</Text>
                        <Text className="text-caption text-on-surface-variant">{rec.dosage} {rec.dosage_unit} · {rec.route}</Text>
                      </View>
                    </View>
                    {rec.withdrawal_period_days && (
                      <View className="mt-2 rounded-lg border-l-4 border-status-quarantine bg-error-container/20 px-3 py-2">
                        <Text className="text-caption font-semibold text-status-quarantine">
                          Withdrawal: {rec.withdrawal_period_days} hari
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyTabContent icon="pill" label="Data obat" />
            )
          )}

          {activeTab === 'vaccination' && (
            vaccinationRecords && vaccinationRecords.length > 0 ? (
              <View className="gap-3">
                <Text className="mb-1 font-headline text-headline-sm font-semibold text-on-surface">Riwayat Vaksinasi</Text>
                {vaccinationRecords.map((rec) => (
                  <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E3F2FD]">
                      <MaterialCommunityIcons name="needle" size={20} color="#1565C0" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline text-headline-sm font-semibold text-on-surface">{rec.vaccine_name}</Text>
                      <Text className="text-caption text-on-surface-variant">{formatDate(rec.vaccination_date)} · {rec.route}</Text>
                    </View>
                    {rec.booster_due_date && (
                      <Text className="text-[10px] font-semibold text-info">Booster: {formatDate(rec.booster_due_date)}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyTabContent icon="needle" label="Data vaksinasi" />
            )
          )}

          {activeTab === 'reproduction' && (
            reproductionRecords && reproductionRecords.length > 0 ? (
              <View className="gap-3">
                <Text className="mb-1 font-headline text-headline-sm font-semibold text-on-surface">Riwayat Reproduksi</Text>
                {reproductionRecords.map((rec) => (
                  <View key={rec._id} className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                      <MaterialCommunityIcons name="baby-face-outline" size={20} color="#9333EA" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline text-headline-sm font-semibold text-on-surface capitalize">{rec.event_type}</Text>
                      <Text className="text-caption text-on-surface-variant">{formatDate(rec.event_date)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyTabContent icon="baby-face-outline" label="Data reproduksi" />
            )
          )}

          {activeTab === 'status' && (
            <View className="gap-4">
              <Text className="font-headline text-headline-sm font-semibold text-on-surface">
                Riwayat Status
              </Text>
              <View className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-status-active/20">
                  <MaterialCommunityIcons name="flag" size={22} color="#52B788" />
                </View>
                <View className="flex-1">
                  <Text className="font-headline text-headline-sm font-semibold text-on-surface">
                    {getStatusLabel(livestock.current_status)}
                  </Text>
                  <Text className="mt-0.5 font-body text-body-sm text-on-surface-variant">
                    Status saat ini · Sejak {formatDate(livestock.updated_at)}
                  </Text>
                </View>
              </View>

              {livestock.current_status === 'quarantine' && canClearQuarantine && (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(modals)/clearance',
                      params: {
                        quarantineId: 'current',
                        earTag: livestock.ear_tag,
                        animalName: livestock.name ?? livestock.species,
                        startDate: livestock.updated_at,
                        durationDays: '14',
                        penCode: getPenCode(livestock.current_pen_id),
                        diseaseSuspected: '',
                      },
                    })
                  }
                  className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-status-quarantine bg-status-quarantine/5 py-3 active:scale-[0.98]"
                >
                  <MaterialCommunityIcons name="check-decagram" size={20} color="#E63946" />
                  <Text className="font-headline text-headline-sm font-bold text-status-quarantine">
                    Proses Clearance Karantina
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* ── SpeedDial FAB ── */}
      <FAB
        isOpen={fabOpen}
        onToggle={() => setFabOpen((v) => !v)}
        items={SPEED_DIAL_ITEMS}
        onItemPress={handleFabItemPress}
        bottomOffset={88}
      />

      {/* ── Menu BottomSheet (Edit/Delete) ── */}
      <BottomSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={`${livestock.ear_tag} — ${livestock.name ?? livestock.species}`}
      >
        <View className="gap-2">
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              if (!livestock) return;
              router.push({
                pathname: '/(modals)/edit-livestock',
                params: {
                  livestockId: livestock._id,
                  earTag: livestock.ear_tag,
                  name: livestock.name ?? '',
                  species: livestock.species,
                  breed: livestock.breed,
                  sex: livestock.sex,
                  birthDate: livestock.birth_date ?? '',
                  origin: livestock.origin,
                  penId: typeof livestock.current_pen_id === 'object' && livestock.current_pen_id !== null
                    ? (livestock.current_pen_id as any)._id
                    : (livestock.current_pen_id as string) ?? '',
                  nationalId: livestock.national_id ?? '',
                  rfidTag: livestock.rfid_tag ?? '',
                  notes: livestock.notes ?? '',
                  photoUrl: livestock.photo_url ?? '',
                },
              });
            }}
            className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3.5 active:bg-surface-container"
          >
            <MaterialCommunityIcons name="pencil" size={22} color="#2D6A4F" />
            <Text className="text-body-lg text-on-surface">Edit Data Ternak</Text>
          </Pressable>
          {canDeleteLivestock && (
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                handleDelete();
              }}
              className="flex-row items-center gap-3 rounded-xl border border-danger/20 bg-danger-light px-4 py-3.5 active:opacity-70"
            >
              <MaterialCommunityIcons name="delete" size={22} color="#BA1A1A" />
              <Text className="text-body-lg font-semibold text-error">Hapus Ternak</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setMenuOpen(false)}
            className="items-center py-3"
          >
            <Text className="text-label-md text-on-surface-variant">Batal</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Dashboard Screen — PRD Screen 2 spec
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

import { useAuthStore } from '@/store/auth';
import { useDashboardSummary } from '@/hooks/useDashboard';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function formatADG(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Math.round(value)}g`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-3 font-label text-label-md font-semibold uppercase tracking-widest text-on-surface-variant">
      {children}
    </Text>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: IconName;
  tone: 'active' | 'sick' | 'quarantine' | 'primary';
}) {
  const isPrimary = tone === 'primary';
  const iconBg = {
    active: 'bg-brand-light',
    sick: 'bg-status-sick/20',
    quarantine: 'bg-error-container',
    primary: 'bg-white/20',
  }[tone];
  const iconColor = {
    active: '#52B788',
    sick: '#F4A261',
    quarantine: '#E63946',
    primary: '#FFFFFF',
  }[tone];

  return (
    <View
      className={[
        'flex-1 rounded-xl border p-md shadow-sm',
        isPrimary
          ? 'border-primary bg-primary'
          : 'border-outline-variant bg-surface-container-lowest',
      ].join(' ')}
    >
      <View className="mb-4 flex-row items-start justify-between gap-2">
        <Text
          className={[
            'flex-1 font-caption text-caption font-semibold uppercase tracking-wide',
            isPrimary ? 'text-on-primary/80' : 'text-on-surface-variant',
          ].join(' ')}
        >
          {label}
        </Text>
        <View className={["h-8 w-8 items-center justify-center rounded-full", iconBg].join(' ')}>
          <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        </View>
      </View>
      <View className="flex-row items-end gap-1">
        <Text
          className={[
            'font-display text-headline-lg font-bold',
            isPrimary
              ? 'text-on-primary'
              : tone === 'quarantine'
                ? 'text-status-quarantine'
                : 'text-on-surface',
          ].join(' ')}
        >
          {value}
        </Text>
        {suffix ? (
          <Text className={isPrimary ? 'mb-0.5 text-caption text-on-primary/80' : 'mb-0.5 text-caption text-on-surface-variant'}>
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function AlertRow({
  title,
  lines,
  icon,
  tone,
}: {
  title: string;
  lines: string[];
  icon: IconName;
  tone: 'danger' | 'warning' | 'info';
}) {
  const styles = {
    danger: {
      card: 'border-l-status-quarantine bg-error-container/50',
      iconBg: 'bg-white',
      iconColor: '#E63946',
      text: 'text-status-quarantine',
    },
    warning: {
      card: 'border-l-status-sick bg-[#FFF8E1]',
      iconBg: 'bg-white',
      iconColor: '#F4A261',
      text: 'text-[#F57C00]',
    },
    info: {
      card: 'border-l-info bg-info-light',
      iconBg: 'bg-white',
      iconColor: '#1565C0',
      text: 'text-info',
    },
  }[tone];

  return (
    <View className={["flex-row gap-md rounded-xl border-l-4 p-md shadow-sm", styles.card].join(' ')}>
      <View className={["h-10 w-10 items-center justify-center rounded-full shadow-sm", styles.iconBg].join(' ')}>
        <MaterialCommunityIcons name={icon} size={20} color={styles.iconColor} />
      </View>
      <View className="flex-1 gap-1">
        <Text className={["font-headline text-headline-sm font-bold uppercase", styles.text].join(' ')}>
          {title}
        </Text>
        {lines.map((line, i) => (
          <Text key={`${line}-${i}`} className="font-body text-body-md text-on-surface-variant">
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

function TimelineMiniItem({
  title,
  description,
  time,
  tone,
}: {
  title: string;
  description: string;
  time: string;
  tone: 'active' | 'sick' | 'muted';
}) {
  const dotColor = {
    active: 'bg-status-active',
    sick: 'bg-status-sick',
    muted: 'bg-outline',
  }[tone];

  return (
    <View className="relative flex-row gap-md pb-4 last:pb-0">
      <View className="w-6 items-center">
        <View className={`mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface-container-lowest ${dotColor}`} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 font-headline text-headline-sm font-semibold text-on-surface">
            {title}
          </Text>
          <Text className="font-caption text-caption text-outline">{time}</Text>
        </View>
        <Text className="mt-0.5 font-body text-body-md text-on-surface-variant">
          {description}
        </Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardSummary();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const avgADG = data?.recent.growth.length
    ? data.recent.growth.reduce((sum, r) => sum + (r.adg_calculated ?? 0), 0) / data.recent.growth.length
    : null;

  const alertCount =
    (data?.alerts.upcoming_boosters.length ?? 0) +
    (data?.alerts.active_withdrawals.length ?? 0) +
    (data?.quarantine.active ?? 0);

  const timelineItems = [
    ...(data?.recent.growth.slice(0, 2).map((g) => ({
      title: `${g.livestock_id.ear_tag} — Timbang`,
      description: `${g.weight_kg}kg${g.adg_calculated ? ` · ADG ${formatADG(g.adg_calculated)}` : ''}`,
      time: formatDate(g.record_date),
      tone: 'active' as const,
    })) ?? []),
    ...(data?.recent.health.slice(0, 2).map((h) => ({
      title: `${h.livestock_id.ear_tag} — ${h.diagnosis ?? h.chief_complaint}`,
      description: h.examiner ? `Oleh ${h.examiner.name}` : 'Pemeriksaan kesehatan',
      time: formatDate(h.record_date),
      tone: 'sick' as const,
    })) ?? []),
  ];

  const displayTimeline = timelineItems;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={['#0F5238']}
            tintColor="#0F5238"
          />
        }
      >
        {/* Header — PRD: logo + title + bell with badge + profile avatar */}
        <View className="flex-row items-center justify-between px-gutter py-sm">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
              <MaterialCommunityIcons name="sprout" size={24} color="#FFFFFF" />
            </View>
            <Text className="font-headline text-headline-lg font-bold text-primary">Bodogol Farm</Text>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Notification bell — scrolls to alerts section */}
            <Pressable
              onPress={() => {
                // Navigate to reports withdrawal alert as the most critical notification
                router.push('/(tabs)/reports');
              }}
              className="relative h-11 w-11 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high"
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color="#404943" />
              {alertCount > 0 && (
                <View className="absolute right-1.5 top-1.5 min-w-[18px] items-center rounded-full bg-status-quarantine px-1">
                  <Text className="font-caption text-[10px] font-bold text-white">{alertCount > 9 ? '9+' : alertCount}</Text>
                </View>
              )}
            </Pressable>
            {/* Profile avatar — navigates to Settings */}
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary-100 bg-primary-container"
            >
              <MaterialCommunityIcons name="account" size={21} color="#A8E7C5" />
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <View className="px-gutter pb-lg pt-sm">
          <Text className="font-display text-display font-bold text-on-surface">
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Petugas'}
          </Text>
          <Text className="mt-1 font-body text-body-lg text-on-surface-variant">
            Berikut ringkasan dari peternakan hari ini.
          </Text>
        </View>

        {/* Error banner */}
        {isError ? (
          <View className="mx-gutter mb-lg rounded-xl border border-danger bg-danger-light p-md">
            <Text className="font-headline text-headline-sm font-bold text-danger">Gagal memuat data</Text>
            <Text className="mt-1 font-body text-body-md text-on-surface-variant">Tarik layar ke bawah untuk mencoba lagi.</Text>
          </View>
        ) : null}

        {/* Summary stat cards */}
        <View className="px-gutter pb-lg">
          <SectionLabel>Ringkasan Hari Ini</SectionLabel>
          <View className="gap-gutter">
            <View className="flex-row gap-gutter">
              <StatCard
                label="Aktif"
                value={data?.livestock.active ?? (isLoading ? '...' : 0)}
                suffix="ekor"
                icon="paw"
                tone="active"
              />
              <StatCard
                label="Sakit"
                value={data?.livestock.sick ?? (isLoading ? '...' : 0)}
                suffix="ekor"
                icon="medical-bag"
                tone="sick"
              />
            </View>
            <View className="flex-row gap-gutter">
              <StatCard
                label="Karantina"
                value={data?.quarantine.active ?? (isLoading ? '...' : 0)}
                suffix="ekor"
                icon="alert"
                tone="quarantine"
              />
              <StatCard
                label="ADG Avg"
                value={avgADG !== null ? formatADG(avgADG) : (isLoading ? '...' : '-')}
                icon="trending-up"
                tone="primary"
              />
            </View>
          </View>
        </View>

        {/* Alerts */}
        <View className="px-gutter pb-lg">
          <View className="flex-row items-center justify-between">
            <SectionLabel>Perlu Perhatian</SectionLabel>
            {alertCount > 0 && (
              <View className="rounded-full bg-status-quarantine/10 px-2.5 py-0.5">
                <Text className="font-label text-label-md font-bold text-status-quarantine">{alertCount}</Text>
              </View>
            )}
          </View>
          <View className="gap-sm">
            {data?.quarantine.active ? (
              <AlertRow
                tone="danger"
                icon="alert-octagon-outline"
                title="Karantina Aktif"
                lines={[
                  `${data.quarantine.active} ekor dalam karantina`,
                  'Perlu pemantauan intensif',
                ]}
              />
            ) : null}
            {data?.alerts.active_withdrawals.map((w) => (
              <AlertRow
                key={w._id}
                tone="warning"
                icon="pill"
                title="Masa Henti Obat"
                lines={[
                  `${w.livestock_id.ear_tag} — ${w.medicine_name ?? 'Obat'}`,
                  `Aman jual: ${formatDate(w.withdrawal_end_date)}`,
                ]}
              />
            ))}
            {data?.alerts.upcoming_boosters.map((b) => (
              <AlertRow
                key={b._id}
                tone="info"
                icon="needle"
                title="Booster Vaksin"
                lines={[
                  `${b.livestock_id.ear_tag} — ${b.vaccine_name ?? 'Vaksin'}`,
                  `Jatuh tempo: ${formatDate(b.booster_due_date)}`,
                ]}
              />
            ))}
            {!data?.quarantine.active && !data?.alerts.active_withdrawals.length && !data?.alerts.upcoming_boosters.length ? (
              <AlertRow
                tone="info"
                icon="check-circle-outline"
                title="Kondisi Stabil"
                lines={['Tidak ada alert kritis saat ini', 'Tetap lakukan pencatatan rutin']}
              />
            ) : null}
          </View>
        </View>

        {/* Mini timeline */}
        <View className="px-gutter pb-lg">
          <SectionLabel>Aktivitas Hari Ini</SectionLabel>
          <View className="relative rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            {displayTimeline.length > 0 ? (
              <>
                <View className="absolute bottom-5 left-[27px] top-5 w-0.5 bg-outline-variant" />
                {displayTimeline.map((item) => (
                  <TimelineMiniItem
                    key={`${item.title}-${item.time}`}
                    {...item}
                  />
                ))}
              </>
            ) : (
              <View className="items-center py-6">
                <MaterialCommunityIcons name="clock-outline" size={32} color="#D0D5D2" />
                <Text className="mt-2 font-body text-body-sm text-on-surface-variant">
                  Belum ada aktivitas terbaru
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/livestock')}
            className="mt-3 flex-row items-center justify-center gap-1 py-2"
          >
            <Text className="font-label text-label-md font-semibold text-primary">Lihat semua aktivitas</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#0F5238" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

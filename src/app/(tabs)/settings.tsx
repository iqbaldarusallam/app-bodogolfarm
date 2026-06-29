// ─────────────────────────────────────────────────────────
// Pengaturan Screen — PRD Screen 15 spec
// All rows wired with onPress
// ─────────────────────────────────────────────────────────

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/store/auth';
import { usePermissions } from '@/lib/permissions';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const ACCOUNT_ITEMS: { label: string; icon: IconName; action: string }[] = [
  { label: 'Profil Saya', icon: 'account-circle-outline', action: 'profile' },
  { label: 'Ganti Password', icon: 'lock-outline', action: 'password' },
];

const MANAGEMENT_ITEMS: { label: string; icon: IconName; action: string }[] = [
  { label: 'Kelola Petugas', icon: 'account-group-outline', action: 'officers' },
  { label: 'Kelola Kandang', icon: 'fence', action: 'pens' },
  { label: 'Master Data Pakan', icon: 'archive-outline', action: 'feed' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-sm">
      <Text className="font-label text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
        {title}
      </Text>
      <View className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  label,
  icon,
  danger = false,
  badge,
  onPress,
}: {
  label: string;
  icon: IconName;
  danger?: boolean;
  badge?: string;
  onPress?: () => void;
}) {
  const color = danger ? '#BA1A1A' : '#404943';

  return (
    <Pressable
      onPress={onPress}
      className="min-h-14 flex-row items-center justify-between border-b border-outline-variant px-4 py-3.5 last:border-b-0 active:bg-surface-container"
    >
      <View className="flex-row items-center gap-3">
        <MaterialCommunityIcons name={icon} size={22} color={color} />
        <Text
          className={["font-body text-body-lg", danger ? 'font-semibold text-error' : 'text-on-surface'].join(' ')}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {badge ? (
          <View className="rounded-full bg-status-active/10 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-status-active">{badge}</Text>
          </View>
        ) : null}
        <MaterialCommunityIcons name="chevron-right" size={22} color={color} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { canManageMasterData } = usePermissions();

  const handleAction = (action: string) => {
    if (action === 'pens') { router.push('/(modals)/manage-pens'); return; }
    if (action === 'feed') { router.push('/(modals)/feed-master'); return; }
    if (action === 'officers') { router.push('/(modals)/manage-users'); return; }
    if (action === 'password') { router.push('/(modals)/change-password'); return; }
    if (action === 'about') {
      Alert.alert(
        'Tentang Aplikasi',
        'Bodogol Farm Livestock v1.0.0\n\nSistem Manajemen Peternakan Pintar\nCapstone Design — President University\n\nTim: Eden Al Farizi, Iqbal Darusallam, Celvine Brains',
        [{ text: 'OK' }],
      );
      return;
    }
    // Placeholder for complex management screens
    Alert.alert(
      action.charAt(0).toUpperCase() + action.slice(1),
      'Fitur ini akan tersedia di versi berikutnya.',
      [{ text: 'OK' }],
    );
  };

  const handleSync = () => {
    Alert.alert('Sinkronisasi', 'Aplikasi beroperasi secara online.\n\nSemua data langsung tersimpan ke server saat terhubung.', [{ text: 'OK' }]);
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: logout },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="px-gutter py-sm">
        <Text className="font-headline text-headline-lg font-bold text-on-surface">
          Pengaturan
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View className="mb-6 items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
          <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-primary-100 bg-primary-container shadow-md">
            <MaterialCommunityIcons name="account" size={36} color="#A8E7C5" />
          </View>
          <Text className="mt-3 text-center font-headline text-headline-md font-bold text-on-surface">
            {user?.name ?? 'Eden Al Farizi'}
          </Text>
          <Text className="mt-1 font-label text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
            {user?.role ?? 'Officer'} · Bodogol Farm
          </Text>
        </View>

        <View className="gap-lg">
          {/* Account */}
          <Section title="Akun">
            {ACCOUNT_ITEMS.map((item) => (
              <SettingsRow
                key={item.label}
                label={item.label}
                icon={item.icon}
                onPress={() => handleAction(item.action)}
              />
            ))}
          </Section>

          {/* Management — hanya senior officer ke atas */}
          {canManageMasterData && (
            <Section title="Manajemen">
              {MANAGEMENT_ITEMS.map((item) => (
                <SettingsRow
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  onPress={() => handleAction(item.action)}
                />
              ))}
            </Section>
          )}

          {/* Sync Status */}
          <Pressable
            onPress={handleSync}
            className="rounded-xl border border-brand-light bg-brand-surface p-md shadow-sm active:opacity-80"
          >
            <View className="flex-row items-center gap-md">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-container">
                <MaterialCommunityIcons name="cloud-check" size={23} color="#A8E7C5" />
              </View>
              <View className="flex-1">
                <Text className="font-headline text-headline-sm font-semibold text-primary">Sinkronisasi</Text>
                <Text className="mt-0.5 font-caption text-caption text-on-surface-variant">Status: Online</Text>
              </View>
              <View className="rounded-lg bg-primary px-4 py-2.5 shadow-md">
                <Text className="font-label text-label-md font-semibold text-on-primary">OK</Text>
              </View>
            </View>
          </Pressable>

          {/* Others */}
          <Section title="Lainnya">
            <SettingsRow label="Notifikasi" icon="bell-ring-outline" badge="AKTIF" onPress={() => handleAction('notifications')} />
            <SettingsRow label="Tentang Aplikasi" icon="information-outline" onPress={() => handleAction('about')} />
            <View className="items-center border-t border-outline-variant py-3">
              <Text className="font-caption text-caption text-on-surface-variant">Versi 1.0.0</Text>
            </View>
          </Section>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            className="h-[52px] flex-row items-center justify-center gap-2 rounded-xl border-2 border-danger active:scale-[0.98]"
          >
            <MaterialCommunityIcons name="logout" size={20} color="#BA1A1A" />
            <Text className="font-headline text-headline-sm font-bold text-danger">Keluar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

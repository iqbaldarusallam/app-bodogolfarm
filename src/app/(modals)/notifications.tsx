// ─────────────────────────────────────────────────────────
// Notifications Screen — list of alerts and notifications
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import type { NotificationItem } from '@/services/notifications';

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getNotificationIcon(type: string): { icon: string; color: string; bg: string } {
  const map: Record<string, { icon: string; color: string; bg: string }> = {
    vaccination_due: { icon: 'needle', color: '#0D9488', bg: '#E0F2F1' },
    withdrawal_active: { icon: 'pill', color: '#D32F2F', bg: '#FDECEA' },
    low_stock: { icon: 'package-variant', color: '#F57C00', bg: '#FFF3E0' },
    sick_livestock: { icon: 'medical-bag', color: '#E65100', bg: '#FBE9E7' },
    quarantine_active: { icon: 'shield-alert', color: '#C62828', bg: '#FFEBEE' },
  };
  return map[type] ?? { icon: 'bell', color: '#707973', bg: '#F5F5F5' };
}

function NotificationCard({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  const { icon, color, bg } = getNotificationIcon(item.type);

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl border p-4 ${
        item.is_read
          ? 'border-outline-variant bg-surface-container-lowest'
          : 'border-primary/20 bg-primary/5'
      }`}
    >
      <View className="flex-row gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: bg }}
        >
          <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className={`flex-1 font-headline text-headline-sm font-semibold ${
                item.is_read ? 'text-on-surface-variant' : 'text-on-surface'
              }`}
            >
              {item.title}
            </Text>
            {!item.is_read && (
              <View className="h-2 w-2 rounded-full bg-primary" />
            )}
          </View>
          <Text className="mt-1 text-body-md text-on-surface-variant">{item.message}</Text>
          <View className="mt-2 flex-row items-center gap-2">
            {item.livestock_ear_tag && (
              <View className="rounded-full bg-surface-container px-2 py-0.5">
                <Text className="text-[10px] font-semibold text-on-surface-variant">
                  #{item.livestock_ear_tag}
                </Text>
              </View>
            )}
            <Text className="text-caption text-outline">{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleNotificationPress = useCallback(
    (item: NotificationItem) => {
      if (!item.is_read) {
        markRead.mutate(item.id);
      }
      // Navigate to relevant screen based on notification type
      if (item.livestock_id) {
        router.push(`/(tabs)/livestock/${item.livestock_id}`);
      }
    },
    [markRead, router],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllRead.mutate();
  }, [markAllRead]);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
          </Pressable>
          <Text className="font-headline text-headline-lg font-bold text-primary">Notifikasi</Text>
        </View>
        {unreadCount > 0 && (
          <Pressable
            onPress={handleMarkAllRead}
            className="rounded-full bg-primary/10 px-3 py-1.5"
          >
            <Text className="text-label-sm font-semibold text-primary">Tandai Semua Dibaca</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F5238" />
          <Text className="mt-3 text-body-md text-on-surface-variant">Memuat notifikasi...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#D0D5D2" />
          <Text className="mt-3 text-center text-body-lg font-semibold text-on-surface-variant">
            Gagal memuat notifikasi
          </Text>
          <Text className="mt-1 text-center text-body-sm text-on-surface-variant">
            Tarik layar ke bawah untuk mencoba lagi
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="bell-off-outline" size={56} color="#D0D5D2" />
          <Text className="mt-3 text-center text-body-lg font-semibold text-on-surface-variant">
            Tidak ada notifikasi
          </Text>
          <Text className="mt-1 text-center text-body-sm text-on-surface-variant">
            Semua dalam kondisi baik
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          {data?.summary && (
            <View className="mb-4 flex-row flex-wrap gap-2">
              {data.summary.vaccination_due > 0 && (
                <View className="rounded-full bg-[#E0F2F1] px-3 py-1">
                  <Text className="text-[10px] font-bold text-[#0D9488]">
                    {data.summary.vaccination_due} vaksin jatuh tempo
                  </Text>
                </View>
              )}
              {data.summary.withdrawal_active > 0 && (
                <View className="rounded-full bg-[#FDECEA] px-3 py-1">
                  <Text className="text-[10px] font-bold text-[#D32F2F]">
                    {data.summary.withdrawal_active} masa henti obat
                  </Text>
                </View>
              )}
              {data.summary.sick_livestock > 0 && (
                <View className="rounded-full bg-[#FBE9E7] px-3 py-1">
                  <Text className="text-[10px] font-bold text-[#E65100]">
                    {data.summary.sick_livestock} ternak sakit
                  </Text>
                </View>
              )}
              {data.summary.quarantine_active > 0 && (
                <View className="rounded-full bg-[#FFEBEE] px-3 py-1">
                  <Text className="text-[10px] font-bold text-[#C62828]">
                    {data.summary.quarantine_active} karantina aktif
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Notification list */}
          <View className="gap-3">
            {notifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onPress={() => handleNotificationPress(item)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

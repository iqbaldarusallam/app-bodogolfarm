// ─────────────────────────────────────────────────────────
// Offline Banner — shows offline status & sync progress
// ─────────────────────────────────────────────────────────

import { ActivityIndicator, Pressable, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOnlineStatus } from '@/offline/useOnlineStatus';
import { useSyncStatus } from '@/offline/useSyncStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { pending, hasPending, isSyncing, flush } = useSyncStatus();

  // Show syncing banner
  if (isOnline && isSyncing) {
    return (
      <View className="flex-row items-center justify-center gap-2 bg-[#E8F5E9] px-4 py-2">
        <ActivityIndicator size="small" color="#2E7D32" />
        <Text className="text-caption font-medium text-[#2E7D32]">
          Menyinkronkan data offline...
        </Text>
      </View>
    );
  }

  // Show pending sync banner
  if (isOnline && hasPending) {
    return (
      <Pressable
        onPress={flush}
        className="flex-row items-center justify-center gap-2 bg-[#FFF3E0] px-4 py-2"
      >
        <MaterialCommunityIcons name="cloud-upload" size={14} color="#E65100" />
        <Text className="text-caption font-medium text-[#E65100]">
          {pending} data menunggu sinkronisasi
        </Text>
        <Text className="text-caption font-bold text-[#E65100]">Ketuk untuk sinkron</Text>
      </Pressable>
    );
  }

  // Show offline banner
  if (!isOnline) {
    return (
      <View className="flex-row items-center justify-center gap-2 bg-[#FFF8E1] px-4 py-2">
        <MaterialCommunityIcons name="wifi-off" size={14} color="#F57C00" />
        <Text className="text-caption font-medium text-[#F57C00]">
          Offline — data tersimpan lokal, akan disinkron saat online
        </Text>
      </View>
    );
  }

  // Online and synced — no banner
  return null;
}

// ─────────────────────────────────────────────────────────
// Offline Banner — slim yellow strip when disconnected
// ─────────────────────────────────────────────────────────

import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function OfflineBanner() {
  return (
    <View className="flex-row items-center justify-center gap-2 bg-[#FFF8E1] px-4 py-2">
      <MaterialCommunityIcons name="wifi-off" size={14} color="#F57C00" />
      <Text className="text-caption font-medium text-[#F57C00]">
        Tidak ada koneksi — Data disimpan lokal
      </Text>
    </View>
  );
}

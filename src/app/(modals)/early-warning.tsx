// ─────────────────────────────────────────────────────────
// Early Warning System Screen — alert peringatan dini
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useActiveAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
} from '@/hooks/useEarlyWarning';
import type { EarlyWarningAlert } from '@/services/earlyWarning';

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

function getPriorityConfig(priority: string): { icon: string; color: string; bg: string; label: string } {
  const map: Record<string, { icon: string; color: string; bg: string; label: string }> = {
    high: { icon: 'alert-circle', color: '#C62828', bg: '#FFEBEE', label: 'TINGGI' },
    medium: { icon: 'alert', color: '#F57C00', bg: '#FFF3E0', label: 'SEDANG' },
    low: { icon: 'information', color: '#1565C0', bg: '#E3F2FD', label: 'RENDAH' },
  };
  return map[priority] ?? map.low;
}

function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
}: {
  alert: EarlyWarningAlert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const { icon, color, bg, label } = getPriorityConfig(alert.priority);

  return (
    <View
      className="rounded-xl border p-4 shadow-sm"
      style={{ borderColor: `${color}30`, backgroundColor: alert.status === 'active' ? bg : '#FFFFFF' }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: bg }}>
          <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-headline text-body-md font-semibold text-on-surface">{alert.title}</Text>
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: bg }}>
              <Text className="text-[10px] font-bold" style={{ color }}>{label}</Text>
            </View>
          </View>
          <Text className="text-caption text-on-surface-variant">{formatDate(alert.triggered_at)}</Text>
        </View>
        {alert.is_escalated && (
          <View className="rounded-full bg-status-quarantine/10 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-status-quarantine">ESKALASI</Text>
          </View>
        )}
      </View>

      {/* Message */}
      <Text className="mt-3 text-body-md text-on-surface">{alert.message}</Text>

      {/* Recommended Action */}
      {alert.recommended_action && (
        <View className="mt-3 flex-row items-start gap-2 rounded-lg bg-surface-muted p-3">
          <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#F57C00" />
          <Text className="flex-1 text-caption text-on-surface-variant">{alert.recommended_action}</Text>
        </View>
      )}

      {/* Related Entity */}
      {alert.trigger_livestock_id && (
        <View className="mt-2 flex-row items-center gap-1">
          <MaterialCommunityIcons name="paw" size={12} color="#707973" />
          <Text className="text-[10px] text-on-surface-variant">
            #{alert.trigger_livestock_id.ear_tag} — {alert.trigger_livestock_id.name ?? ''}
          </Text>
        </View>
      )}
      {alert.trigger_cage_id && (
        <View className="mt-2 flex-row items-center gap-1">
          <MaterialCommunityIcons name="home" size={12} color="#707973" />
          <Text className="text-[10px] text-on-surface-variant">Kandang: {alert.trigger_cage_id.pen_code}</Text>
        </View>
      )}

      {/* Actions */}
      {alert.status === 'active' && (
        <View className="mt-3 flex-row gap-2">
          <Pressable
            onPress={() => onAcknowledge(alert._id)}
            className="flex-1 h-8 items-center justify-center rounded-lg border border-outline"
          >
            <Text className="text-[10px] font-semibold text-on-surface-variant">Saya Lihat</Text>
          </Pressable>
          <Pressable
            onPress={() => onResolve(alert._id)}
            className="flex-1 h-8 items-center justify-center rounded-lg bg-primary"
          >
            <Text className="text-[10px] font-bold text-on-primary">Selesai Ditangani</Text>
          </Pressable>
        </View>
      )}
      {alert.status === 'acknowledged' && (
        <View className="mt-3 flex-row items-center gap-1">
          <MaterialCommunityIcons name="check" size={12} color="#52B788" />
          <Text className="text-[10px] text-on-surface-variant">Sudah dilihat — tunggu penanganan</Text>
        </View>
      )}
    </View>
  );
}

export default function EarlyWarningScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const { data: alerts = [], isLoading } = useActiveAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((a) => a.priority === filter);
  const highCount = alerts.filter((a) => a.priority === 'high').length;
  const mediumCount = alerts.filter((a) => a.priority === 'medium').length;
  const lowCount = alerts.filter((a) => a.priority === 'low').length;

  const handleAcknowledge = useCallback(
    (id: string) => {
      acknowledgeAlert.mutate(id);
    },
    [acknowledgeAlert],
  );

  const handleResolve = useCallback(
    (id: string) => {
      Alert.alert('Selesaikan Alert', 'Tandai alert ini sudah ditangani?', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Selesai',
          onPress: () => resolveAlert.mutate({ alertId: id }),
        },
      ]);
    },
    [resolveAlert],
  );

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
        <Text className="flex-1 text-center pr-12 font-headline text-headline-md font-semibold text-on-surface">
          Early Warning
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F5238" />
          <Text className="mt-3 text-body-md text-on-surface-variant">Memuat alert...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <View className="mb-4 flex-row gap-2">
            {[
              { key: 'all', label: 'Semua', count: alerts.length, color: '#404943' },
              { key: 'high', label: 'Tinggi', count: highCount, color: '#C62828' },
              { key: 'medium', label: 'Sedang', count: mediumCount, color: '#F57C00' },
              { key: 'low', label: 'Rendah', count: lowCount, color: '#1565C0' },
            ].map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key as any)}
                className={`flex-1 rounded-lg py-2 ${
                  filter === item.key
                    ? 'bg-primary'
                    : 'border border-outline-variant bg-surface-container-lowest'
                }`}
              >
                <Text
                  className={`text-center text-[10px] font-semibold ${
                    filter === item.key ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {item.label} ({item.count})
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Alert List */}
          {filteredAlerts.length === 0 ? (
            <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-12">
              <MaterialCommunityIcons name="shield-check" size={48} color="#52B788" />
              <Text className="mt-3 text-body-md font-semibold text-on-surface-variant">Tidak ada alert</Text>
              <Text className="mt-1 text-caption text-on-surface-variant">Semua dalam kondisi aman</Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert._id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

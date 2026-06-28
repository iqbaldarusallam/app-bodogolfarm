import { useEffect, useMemo } from 'react';
import { Animated, View, Text } from 'react-native';
import type { LivestockStatus } from '@/types/livestock';

const STATUS_CONFIG: Record<LivestockStatus, { label: string; bg: string; text: string; dot: string; border?: string }> = {
  active: { label: 'Aktif', bg: 'bg-status-active/20', text: 'text-status-active', dot: 'bg-status-active' },
  sick: { label: 'Sakit', bg: 'bg-status-sick/20', text: 'text-status-sick', dot: 'bg-status-sick' },
  quarantine: { label: 'Karantina', bg: 'bg-status-quarantine/10', text: 'text-status-quarantine', dot: 'bg-status-quarantine', border: 'border border-status-quarantine/30' },
  sold: { label: 'Terjual', bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
  dead: { label: 'Mati', bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
  transferred: { label: 'Dipindah', bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
};

function PulsingDot({ color }: { color: string }) {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [scaleAnim]);

  return (
    <View className="relative">
      <Animated.View
        className={`h-2 w-2 rounded-full ${color}`}
        style={{ transform: [{ scale: scaleAnim }] }}
      />
    </View>
  );
}

export function StatusBadge({ status }: { status: LivestockStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const isQuarantine = status === 'quarantine';

  return (
    <View className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${config.bg} ${config.border ?? ''}`}>
      {isQuarantine ? (
        <PulsingDot color={config.dot} />
      ) : (
        <View className={`h-2 w-2 rounded-full ${config.dot}`} />
      )}
      <Text className="font-label text-label-md font-bold uppercase tracking-wider text-on-surface-variant">{config.label}</Text>
    </View>
  );
}

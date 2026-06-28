import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimelineItemType = 'growth' | 'feeding' | 'health' | 'medication' | 'vaccination' | 'quarantine' | 'clearance' | 'reproduction' | 'status';

const TYPE_CONFIG: Record<TimelineItemType, { icon: string; color: string }> = {
  growth: { icon: 'scale-bathroom', color: '#52B788' },
  feeding: { icon: 'food', color: '#A8DADC' },
  health: { icon: 'medical-bag', color: '#F57C00' },
  medication: { icon: 'pill', color: '#F4A261' },
  vaccination: { icon: 'needle', color: '#1565C0' },
  quarantine: { icon: 'shield-alert', color: '#E63946' },
  clearance: { icon: 'check-decagram', color: '#2E7D32' },
  reproduction: { icon: 'baby-face-outline', color: '#9B5DE5' },
  status: { icon: 'flag-outline', color: '#8E8E93' },
};

type TimelineItemProps = {
  type: TimelineItemType;
  title: string;
  subtitle: string;
  date: string;
  isLast?: boolean;
  highlight?: string;
};

export function TimelineItem({ type, title, subtitle, date, isLast = false, highlight }: TimelineItemProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.status;

  return (
    <View className="flex-row gap-3 pb-4 last:pb-0">
      <View className="w-10 items-center">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${config.color}18` }}
        >
          <MaterialCommunityIcons name={config.icon as any} size={20} color={config.color} />
        </View>
        {!isLast && <View className="mt-1 h-5 w-0.5 bg-outline-variant" />}
      </View>
      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 font-headline text-headline-sm font-semibold text-on-surface">{title}</Text>
          <Text className="font-caption text-caption text-on-surface-variant">{date}</Text>
        </View>
        {subtitle ? (
          <Text className="mt-1 font-body text-body-md text-on-surface-variant">{subtitle}</Text>
        ) : null}
        {highlight ? (
          <View className="mt-1.5 self-start rounded-full bg-error-container px-2.5 py-0.5">
            <Text className="text-[10px] font-bold uppercase text-status-quarantine">{highlight}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// AlertCard — PRD Section 3.3
// Kartu alert untuk dashboard (Danger, Warning, Info, Success)
// ─────────────────────────────────────────────────────────

import { Text, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '@/theme/colors';

type AlertPriority = 'danger' | 'warning' | 'info' | 'success';

interface AlertCardProps {
  priority: AlertPriority;
  title: string;
  lines: string[];
  onPress?: () => void;
}

const priorityConfig: Record<AlertPriority, {
  bg: string;
  border: string;
  icon: string;
  iconColor: string;
  titleColor: string;
}> = {
  danger: {
    bg: '#FDECEA',
    border: colors.danger.default,
    icon: 'alert-circle',
    iconColor: colors.danger.default,
    titleColor: 'text-danger-dark',
  },
  warning: {
    bg: '#FFF8E1',
    border: colors.warning.default,
    icon: 'alert',
    iconColor: colors.warning.default,
    titleColor: 'text-warning-dark',
  },
  info: {
    bg: '#E3F2FD',
    border: colors.info.default,
    icon: 'information',
    iconColor: colors.info.default,
    titleColor: 'text-info-dark',
  },
  success: {
    bg: '#E8F5E9',
    border: colors.success.default,
    icon: 'check-circle',
    iconColor: colors.success.default,
    titleColor: 'text-success-dark',
  },
};

export function AlertCard({ priority, title, lines, onPress }: AlertCardProps) {
  const config = priorityConfig[priority];

  const content = (
    <View
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: config.bg,
        borderLeftWidth: 4,
        borderLeftColor: config.border,
      }}
    >
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialCommunityIcons
            name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={18}
            color={config.iconColor}
          />
          <Text className={`text-sm font-semibold ${config.titleColor}`}>
            {title}
          </Text>
        </View>

        {lines.map((line, i) => (
          <Text key={i} className="text-xs text-gray-600 leading-5 ml-6" numberOfLines={2}>
            {line}
          </Text>
        ))}

        {onPress && (
          <Text className="text-xs font-semibold mt-2 ml-6" style={{ color: config.iconColor }}>
            LIHAT →
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="active:opacity-80"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

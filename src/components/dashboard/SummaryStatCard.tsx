// ─────────────────────────────────────────────────────────
// SummaryStatCard — PRD Section 3.7
// Kartu ringkasan angka di dashboard (Aktif, Sakit, Karantina, ADG)
// ─────────────────────────────────────────────────────────

import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '@/theme/colors';

type StatVariant = 'default' | 'danger' | 'warning' | 'success';

interface SummaryStatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  subtitle?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: StatVariant;
}

const variantStyles: Record<StatVariant, { bg: string; border: string; text: string; icon: string }> = {
  default: {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-primary-700',
    icon: colors.primary[500],
  },
  danger: {
    bg: 'bg-danger-light',
    border: 'border-danger/30',
    text: 'text-danger',
    icon: colors.danger.default,
  },
  warning: {
    bg: 'bg-warning-light',
    border: 'border-warning/30',
    text: 'text-warning-dark',
    icon: colors.warning.default,
  },
  success: {
    bg: 'bg-success-light',
    border: 'border-success/30',
    text: 'text-success-dark',
    icon: colors.success.default,
  },
};

export function SummaryStatCard({
  label,
  value,
  suffix = 'ekor',
  subtitle,
  icon,
  variant = 'default',
}: SummaryStatCardProps) {
  const vs = variantStyles[variant];

  return (
    <View
      className={`${vs.bg} ${vs.border} border rounded-lg p-4 flex-1 min-h-[88px] justify-center`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-medium text-gray-500 tracking-wide uppercase">
          {label}
        </Text>
        <MaterialCommunityIcons name={icon} size={20} color={vs.icon} />
      </View>

      <View className="flex-row items-baseline gap-1">
        <Text className={`text-[28px] font-bold leading-tight ${vs.text}`}>
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </Text>
        {suffix && typeof value === 'number' && (
          <Text className="text-xs text-gray-500">{suffix}</Text>
        )}
      </View>

      {subtitle && (
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

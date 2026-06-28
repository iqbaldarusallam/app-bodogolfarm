import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import type { Livestock, Species } from '@/types/livestock';

const SPECIES_ICON: Record<Species, string> = {
  sapi: 'cow',
  domba: 'sheep',
  kambing: 'paw',
  kerbau: 'cow',
};

type LivestockCardProps = {
  item: Livestock;
  onPress: () => void;
};

export function LivestockCard({ item, onPress }: LivestockCardProps) {
  const speciesKey = SPECIES_ICON[item.species] ?? 'cow';
  const iconColor =
    item.current_status === 'quarantine'
      ? '#E63946'
      : item.current_status === 'sick'
        ? '#F4A261'
        : '#52B788';

  const cardBorder =
    item.current_status === 'sick'
      ? 'border-y border-r border-surface-variant border-l-[4px] border-l-status-sick bg-[#FFF8F3]'
      : item.current_status === 'quarantine'
        ? 'border-y border-r border-surface-variant border-l-[4px] border-l-status-quarantine bg-[#FFF5F5]'
        : 'border border-surface-variant bg-surface-container-lowest';

  const sexLabel = item.sex === 'male' ? 'Jantan' : 'Betina';
  const penCode =
    typeof item.current_pen_id === 'object' && 'pen_code' in item.current_pen_id
      ? (item.current_pen_id as { pen_code: string }).pen_code
      : '';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row gap-3 rounded-xl p-3 shadow-sm active:opacity-70 ${cardBorder}`}
    >
      <View className="h-[84px] w-20 items-center justify-center overflow-hidden rounded-lg bg-surface-container-high">
        {item.photo_url ? (
          <Image
            source={{ uri: item.photo_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <MaterialCommunityIcons name={speciesKey as any} size={34} color={iconColor} />
        )}
      </View>

      <View className="flex-1 justify-between gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-mono text-label-md font-bold text-primary">#{item.ear_tag}</Text>
            <Text numberOfLines={1} className="mt-0.5 font-headline text-headline-sm font-semibold text-on-surface">
              {item.name ?? item.species} · {sexLabel}
            </Text>
            <Text numberOfLines={1} className="mt-0.5 font-caption text-caption text-on-surface-variant">
              Kandang: {penCode || '-'} · {item.breed}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#707973" />
        </View>

        <View className="flex-row">
          <StatusBadge status={item.current_status} />
        </View>
      </View>
    </Pressable>
  );
}

import { Pressable, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type SpeedDialItem = {
  key: string;
  label: string;
  icon: IconName;
  color: string;
};

type FABProps = {
  isOpen: boolean;
  onToggle: () => void;
  items?: SpeedDialItem[];
  onItemPress?: (key: string) => void;
  bottomOffset?: number;
};

export function FAB({ isOpen, onToggle, items = [], onItemPress, bottomOffset = 80 }: FABProps) {
  return (
    <View
      className="absolute right-4 items-end gap-3"
      style={{ bottom: bottomOffset }}
    >
      {isOpen &&
        items.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => onItemPress?.(item.key)}
            className="flex-row items-center gap-2"
          >
            <View className="rounded-lg bg-surface-container-lowest px-3 py-2 shadow-md">
              <Text className="font-label text-label-md font-medium text-on-surface">{item.label}</Text>
            </View>
            <View
              className="h-11 w-11 items-center justify-center rounded-full shadow-md"
              style={{ backgroundColor: item.color }}
            >
              <MaterialCommunityIcons name={item.icon} size={20} color="#FFFFFF" />
            </View>
          </Pressable>
        ))}

      <Pressable
        onPress={onToggle}
        className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <MaterialCommunityIcons
          name={isOpen ? 'close' : 'plus'}
          size={30}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

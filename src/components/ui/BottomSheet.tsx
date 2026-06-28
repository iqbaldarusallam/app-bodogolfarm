import { Pressable, View, Text, Modal } from 'react-native';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-surface-container-lowest px-6 pb-8 pt-3"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View className="mb-4 items-center">
            <View className="h-1 w-8 rounded-full bg-outline-variant" />
          </View>

          {title && (
            <Text className="mb-4 text-center font-headline text-headline-md font-bold text-on-surface">
              {title}
            </Text>
          )}

          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

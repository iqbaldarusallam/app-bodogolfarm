// ─────────────────────────────────────────────────────────
// Farm Operation SOP Checklist Screen
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useTodayChecklist,
  useCompleteChecklistItem,
  useSkipChecklistItem,
} from '@/hooks/useFarmChecklist';

function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    high: '#E63946',
    medium: '#F57C00',
    low: '#52B788',
  };
  return map[priority] ?? '#707973';
}

function getStatusIcon(status: string): { icon: string; color: string } {
  const map: Record<string, { icon: string; color: string }> = {
    completed: { icon: 'check-circle', color: '#52B788' },
    skipped: { icon: 'close-circle', color: '#F57C00' },
    overdue: { icon: 'alert-circle', color: '#E63946' },
    pending: { icon: 'checkbox-blank-circle-outline', color: '#707973' },
  };
  return map[status] ?? { icon: 'checkbox-blank-circle-outline', color: '#707973' };
}

export default function FarmChecklistScreen() {
  const router = useRouter();
  const { data: checklist, isLoading } = useTodayChecklist();
  const completeItem = useCompleteChecklistItem();
  const skipItem = useSkipChecklistItem();

  const [skipModal, setSkipModal] = useState<{ itemCode: string; title: string } | null>(null);
  const [skipReason, setSkipReason] = useState('');

  const handleComplete = useCallback(
    (itemCode: string) => {
      if (!checklist) return;
      completeItem.mutate(
        { checklistId: checklist._id, itemCode },
        {
          onSuccess: () => Alert.alert('Berhasil', 'Item checklist ditandai selesai'),
          onError: () => Alert.alert('Gagal', 'Gagal menandai item'),
        },
      );
    },
    [checklist, completeItem],
  );

  const handleSkip = useCallback(
    (itemCode: string, title: string) => {
      setSkipModal({ itemCode, title });
      setSkipReason('');
    },
    [],
  );

  const confirmSkip = useCallback(() => {
    if (!checklist || !skipModal) return;
    if (!skipReason.trim()) {
      Alert.alert('Error', 'Alasan wajib diisi');
      return;
    }
    skipItem.mutate(
      { checklistId: checklist._id, itemCode: skipModal.itemCode, reason: skipReason.trim() },
      {
        onSuccess: () => {
          setSkipModal(null);
          setSkipReason('');
          Alert.alert('Berhasil', 'Item checklist di-skip');
        },
        onError: () => Alert.alert('Gagal', 'Gagal skip item'),
      },
    );
  }, [checklist, skipModal, skipReason, skipItem]);

  const completedCount = checklist?.items.filter((i) => i.status === 'completed').length ?? 0;
  const skippedCount = checklist?.items.filter((i) => i.status === 'skipped').length ?? 0;
  const totalCount = checklist?.items.length ?? 0;
  const progress = totalCount > 0 ? ((completedCount + skippedCount) / totalCount) * 100 : 0;

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
          SOP Harian
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F5238" />
          <Text className="mt-3 text-body-md text-on-surface-variant">Memuat checklist...</Text>
        </View>
      ) : !checklist ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="clipboard-text-off" size={56} color="#D0D5D2" />
          <Text className="mt-3 text-center text-body-lg font-semibold text-on-surface-variant">
            Checklist tidak ditemukan
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <View className="mb-6 rounded-xl border border-primary bg-primary p-4 shadow-md">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-headline text-headline-sm font-bold text-on-primary">Progress Hari Ini</Text>
              <Text className="font-display text-headline-lg font-bold text-on-primary">{Math.round(progress)}%</Text>
            </View>
            <View className="h-2 rounded-full bg-white/30">
              <View className="h-2 rounded-full bg-on-primary" style={{ width: `${progress}%` }} />
            </View>
            <View className="mt-2 flex-row gap-4">
              <Text className="text-caption text-on-primary/80">
                {completedCount} selesai · {skippedCount} skip · {totalCount - completedCount - skippedCount} tersisa
              </Text>
            </View>
          </View>

          {/* Checklist Items */}
          <View className="gap-2">
            {checklist.items.map((item) => {
              const { icon, color } = getStatusIcon(item.status);
              const isDone = item.status === 'completed' || item.status === 'skipped';

              return (
                <View
                  key={item.item_code}
                  className={`rounded-xl border p-4 ${
                    isDone
                      ? 'border-outline-variant bg-surface-container-lowest opacity-60'
                      : 'border-outline-variant bg-surface-container-lowest'
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <MaterialCommunityIcons name={icon as any} size={24} color={color} />
                    <View className="flex-1">
                      <Text className={`font-headline text-body-md font-semibold ${
                        isDone ? 'text-on-surface-variant line-through' : 'text-on-surface'
                      }`}>
                        {item.title}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-2">
                        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${getPriorityColor(item.priority)}15` }}>
                          <Text className="text-[10px] font-bold" style={{ color: getPriorityColor(item.priority) }}>
                            {item.priority.toUpperCase()}
                          </Text>
                        </View>
                        {item.skipped_reason && (
                          <Text className="text-[10px] text-on-surface-variant">Skip: {item.skipped_reason}</Text>
                        )}
                      </View>
                    </View>
                    {!isDone && (
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleSkip(item.item_code, item.title)}
                          className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
                        >
                          <MaterialCommunityIcons name="close" size={16} color="#707973" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleComplete(item.item_code)}
                          className="h-8 w-8 items-center justify-center rounded-full bg-primary"
                        >
                          <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Skip Reason Modal */}
      {skipModal && (
        <View className="absolute inset-0 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-surface-container-lowest p-6">
            <Text className="mb-4 font-headline text-headline-md font-bold text-on-surface">
              Alasan Skip
            </Text>
            <Text className="mb-2 text-body-md text-on-surface-variant">{skipModal.title}</Text>
            <TextInput
              value={skipReason}
              onChangeText={setSkipReason}
              placeholder="Masukkan alasan..."
              placeholderTextColor="#BFC9C1"
              className="mb-4 min-h-[80px] rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-md text-on-surface"
              multiline
              textAlignVertical="top"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setSkipModal(null)}
                className="flex-1 h-12 items-center justify-center rounded-xl border border-outline"
              >
                <Text className="text-headline-sm font-medium text-outline">Batal</Text>
              </Pressable>
              <Pressable
                onPress={confirmSkip}
                className="flex-1 h-12 items-center justify-center rounded-xl bg-primary"
              >
                <Text className="text-headline-sm font-bold text-on-primary">Skip</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

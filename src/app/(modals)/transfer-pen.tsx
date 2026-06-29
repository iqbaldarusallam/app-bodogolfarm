// ─────────────────────────────────────────────────────────
// Form Transfer Kandang — pindah ternak ke kandang lain
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { transferPen } from '@/services/livestock';
import { getPens } from '@/services/quarantine';

// ── Main Screen ──

export default function TransferPenScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
    animalName = '',
    currentPenCode = '',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    animalName: string;
    currentPenCode: string;
  }>();

  // ── Data ──
  const { data: pens = [], isLoading: loadingPens } = useQuery({
    queryKey: ['pens'],
    queryFn: getPens,
  });

  // ── Form state ──
  const [selectedPenId, setSelectedPenId] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter out current pen and inactive pens, show capacity info
  const availablePens = pens.filter(
    (p) => p._id !== currentPenCode && p.is_active,
  );

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedPenId) newErrors.pen = 'Pilih kandang tujuan';
    if (!reason.trim()) newErrors.reason = 'Alasan transfer wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedPenId, reason]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: () =>
      transferPen(livestockId!, {
        pen_id: selectedPenId,
        reason: reason.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal transfer kandang. Coba lagi.';
      setErrors({ submit: msg });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;
    mutation.mutate();
  }, [validate, mutation]);

  const getPenTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
      regular: 'Kandang Umum',
      quarantine: 'Kandang Karantina',
      nursery: 'Kandang Anakan',
      fattening: 'Kandang Penggemukan',
    };
    return map[type] ?? type;
  };

  const getPenTypeColor = (type: string): string => {
    const map: Record<string, string> = {
      regular: '#52B788',
      quarantine: '#E63946',
      nursery: '#3B82F6',
      fattening: '#F4A261',
    };
    return map[type] ?? '#707973';
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ── Top AppBar ── */}
        <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
          <View className="flex-row items-center gap-md">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
            </Pressable>
            <Text className="font-headline text-headline-lg font-bold text-primary">Transfer Kandang</Text>
          </View>
          <MaterialCommunityIcons name="home-move" size={22} color="#0F5238" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Animal Profile Header ── */}
          <View className="mb-6 flex-row items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <View className="h-20 w-20 items-center justify-center rounded-lg bg-surface-variant">
              <MaterialCommunityIcons name="paw" size={32} color="#0F5238" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-mono text-id-monospace uppercase text-on-surface-variant">
                  ID: #{earTag}
                </Text>
                <View className="flex-row items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-2 py-0.5">
                  <MaterialCommunityIcons name="home" size={12} color="#707973" />
                  <Text className="text-label-sm text-on-surface-variant">
                    {currentPenCode || 'Tanpa Kandang'}
                  </Text>
                </View>
              </View>
              <Text className="mt-1 font-headline text-headline-md text-on-surface">{animalName}</Text>
            </View>
          </View>

          {/* ── Arrow indicator ── */}
          <View className="mb-6 items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MaterialCommunityIcons name="arrow-down" size={24} color="#0F5238" />
            </View>
          </View>

          {/* ── Pen Selection ── */}
          <View className="mb-6 gap-sm">
            <Text className="text-headline-sm text-on-surface-variant">Kandang Tujuan</Text>

            {loadingPens ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#0F5238" />
                <Text className="mt-2 text-body-sm text-on-surface-variant">Memuat data kandang...</Text>
              </View>
            ) : availablePens.length === 0 ? (
              <View className="items-center rounded-xl border border-outline-variant bg-surface-container py-8">
                <MaterialCommunityIcons name="home-off" size={32} color="#D0D5D2" />
                <Text className="mt-2 text-body-md text-on-surface-variant">Tidak ada kandang tersedia</Text>
              </View>
            ) : (
              <View className="gap-2">
                {availablePens.map((pen) => {
                  const selected = selectedPenId === pen._id;
                  const isFull = pen.current_count >= pen.capacity;
                  return (
                    <Pressable
                      key={pen._id}
                      onPress={() => !isFull && setSelectedPenId(pen._id)}
                      disabled={isFull}
                      className={`flex-row items-center gap-3 rounded-xl border-2 p-4 ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : isFull
                            ? 'border-outline-variant bg-surface-container/50 opacity-50'
                            : 'border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      <View
                        className="h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${getPenTypeColor(pen.pen_type)}15` }}
                      >
                        <MaterialCommunityIcons
                          name="home"
                          size={20}
                          color={getPenTypeColor(pen.pen_type)}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-headline text-body-lg font-semibold text-on-surface">
                            {pen.pen_code}
                          </Text>
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: `${getPenTypeColor(pen.pen_type)}15` }}
                          >
                            <Text
                              className="text-label-xs font-medium"
                              style={{ color: getPenTypeColor(pen.pen_type) }}
                            >
                              {getPenTypeLabel(pen.pen_type)}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-body-sm text-on-surface-variant">
                          {pen.current_count}/{pen.capacity} ternak
                          {isFull ? ' — Penuh' : ` — Tersisa ${pen.capacity - pen.current_count}`}
                        </Text>
                      </View>
                      {selected && (
                        <MaterialCommunityIcons name="check-circle" size={22} color="#0F5238" />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
            {errors.pen && <Text className="text-caption text-error">{errors.pen}</Text>}
          </View>

          {/* ── Reason ── */}
          <View className="gap-1">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Alasan Transfer</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              placeholder="Contoh: Penggemukan, karantina, kepadatan, dll."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
            {errors.reason && <Text className="text-caption text-error">{errors.reason}</Text>}
          </View>

          {/* Submit error */}
          {errors.submit && (
            <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-error-container bg-error-container/30 p-3">
              <MaterialCommunityIcons name="alert-circle" size={18} color="#BA1A1A" />
              <Text className="flex-1 text-body-sm text-error">{errors.submit}</Text>
            </View>
          )}
        </ScrollView>

        {/* ── Fixed Action Bar ── */}
        <View className="flex-row gap-3 border-t border-outline-variant bg-surface-container-lowest px-gutter py-md">
          <Pressable
            onPress={() => router.back()}
            className="flex-1 h-12 items-center justify-center rounded-xl border border-outline"
          >
            <Text className="text-headline-sm font-medium text-outline">Batal</Text>
          </Pressable>
          <Pressable
            onPress={onSubmit}
            disabled={mutation.isPending || !selectedPenId}
            className={`flex-1 h-12 items-center justify-center rounded-xl shadow-lg active:scale-[0.98] ${
              selectedPenId ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className={`text-headline-sm font-bold ${selectedPenId ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                Transfer Sekarang
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

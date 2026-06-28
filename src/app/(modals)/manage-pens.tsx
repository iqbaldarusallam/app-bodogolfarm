// ─────────────────────────────────────────────────────────
// Kelola Kandang — Pen Management Modal
// ─────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/auth';
import { getPens, createPen } from '@/services/quarantine';
import type { CreatePenInput } from '@/types/quarantine';

const PEN_TYPES = [
  { label: 'Reguler', value: 'regular' },
  { label: 'Karantina', value: 'quarantine' },
  { label: 'Pedet', value: 'nursery' },
  { label: 'Penggemukan', value: 'fattening' },
] as const;

export default function ManagePensScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: pens = [], isLoading } = useQuery({
    queryKey: ['pens'],
    queryFn: getPens,
    staleTime: 5 * 60 * 1000,
  });

  // ── Create form ──
  const [showForm, setShowForm] = useState(false);
  const [penCode, setPenCode] = useState('');
  const [penType, setPenType] = useState('regular');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTypeLabel = useMemo(
    () => PEN_TYPES.find((t) => t.value === penType)?.label ?? 'Reguler',
    [penType],
  );

  const resetForm = () => {
    setPenCode('');
    setPenType('regular');
    setCapacity('');
    setDescription('');
    setErrors({});
  };

  const handleToggleForm = () => {
    if (showForm) resetForm();
    setShowForm((v) => !v);
  };

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createPen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pens'] });
      resetForm();
      setShowForm(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan';
      setErrors({ submit: msg });
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!penCode.trim()) e.penCode = 'Kode kandang wajib diisi';
    if (!capacity || parseInt(capacity) < 1) e.capacity = 'Kapasitas minimal 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const input: CreatePenInput = {
      farm_id: user!.farm_id,
      pen_code: penCode.trim(),
      pen_type: penType,
      capacity: parseInt(capacity),
      ...(description.trim() ? { description: description.trim() } : {}),
    };
    mutation.mutate(input);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F5238" />
          </Pressable>
          <Text className="font-headline text-headline-md font-bold text-primary">
            Kelola Kandang
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary-fixed">
          <MaterialCommunityIcons name="fence" size={20} color="#0F5238" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Add Button */}
        <Pressable
          onPress={handleToggleForm}
          className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-primary-container/30 py-3 active:scale-[0.98]"
        >
          <MaterialCommunityIcons
            name={showForm ? 'close' : 'plus'}
            size={20}
            color="#0F5238"
          />
          <Text className="font-headline text-headline-sm font-semibold text-primary">
            {showForm ? 'Batal' : 'Tambah Kandang'}
          </Text>
        </Pressable>

        {/* Inline Form */}
        {showForm && (
          <View className="mb-6 gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            {/* Pen Code */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Kode Kandang
              </Text>
              <TextInput
                value={penCode}
                onChangeText={setPenCode}
                placeholder="Contoh: A1, Q2"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
              {errors.penCode && (
                <Text className="text-caption text-error">{errors.penCode}</Text>
              )}
            </View>

            {/* Pen Type */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Tipe Kandang
              </Text>
              <View className="relative">
                <Pressable
                  onPress={() => setShowTypeDropdown((v) => !v)}
                  className="h-[48px] flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface px-4"
                >
                  <Text className="text-body-md text-on-surface">{selectedTypeLabel}</Text>
                  <MaterialCommunityIcons
                    name={showTypeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#707973"
                  />
                </Pressable>
                {showTypeDropdown && (
                  <View className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-outline-variant bg-white shadow-lg">
                    {PEN_TYPES.map((t) => (
                      <Pressable
                        key={t.value}
                        onPress={() => {
                          setPenType(t.value);
                          setShowTypeDropdown(false);
                        }}
                        className={`border-b border-outline-variant/50 px-4 py-3 active:bg-surface-container-low ${
                          penType === t.value ? 'bg-primary-container/30' : ''
                        }`}
                      >
                        <Text className="text-body-md text-on-surface">{t.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Capacity */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Kapasitas (ekor)
              </Text>
              <TextInput
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
              {errors.capacity && (
                <Text className="text-caption text-error">{errors.capacity}</Text>
              )}
            </View>

            {/* Description */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Deskripsi
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Opsional"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
            </View>

            {/* Submit error */}
            {errors.submit && (
              <View className="flex-row items-center gap-2 rounded-lg border border-error-container bg-error-container/30 p-3">
                <MaterialCommunityIcons name="alert-circle" size={16} color="#BA1A1A" />
                <Text className="flex-1 text-caption text-error">{errors.submit}</Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={onSubmit}
              disabled={mutation.isPending}
              className={`h-12 flex-row items-center justify-center gap-2 rounded-xl shadow-md active:scale-[0.98] ${
                mutation.isPending ? 'bg-primary/60' : 'bg-primary'
              }`}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              )}
              <Text className="font-headline text-headline-sm font-bold text-on-primary">
                {mutation.isPending ? 'Menyimpan...' : 'Simpan Kandang'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Pen List */}
        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#0F5238" />
            <Text className="mt-3 text-body-md text-on-surface-variant">Memuat kandang...</Text>
          </View>
        ) : pens.length === 0 ? (
          <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-10">
            <MaterialCommunityIcons name="fence" size={48} color="#BFC9C1" />
            <Text className="mt-3 font-headline text-headline-sm text-on-surface-variant">
              Belum ada kandang
            </Text>
            <Text className="mt-1 text-body-md text-on-surface-variant">
              Tekan Tambah Kandang untuk menambah kandang baru
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {pens.map((pen) => {
              const occupancy = pen.capacity > 0
                ? Math.round((pen.current_count / pen.capacity) * 100)
                : 0;
              const isFull = pen.current_count >= pen.capacity;
              return (
                <View
                  key={pen._id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-container">
                        <MaterialCommunityIcons name="fence" size={20} color="#0F5238" />
                      </View>
                      <View>
                        <Text className="font-headline text-headline-sm font-bold text-on-surface">
                          {pen.pen_code}
                        </Text>
                        <Text className="text-caption capitalize text-on-surface-variant">
                          {pen.pen_type}
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`rounded-full px-2.5 py-1 ${
                        pen.is_active ? 'bg-status-active/10' : 'bg-outline-variant/30'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          pen.is_active ? 'text-status-active' : 'text-on-surface-variant'
                        }`}
                      >
                        {pen.is_active ? 'Aktif' : 'Nonaktif'}
                      </Text>
                    </View>
                  </View>

                  {/* Occupancy Bar */}
                  <View className="mt-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-caption text-on-surface-variant">
                        {pen.current_count}/{pen.capacity} ekor
                      </Text>
                      <Text className="text-caption font-semibold text-on-surface-variant">
                        {occupancy}%
                      </Text>
                    </View>
                    <View className="h-2 overflow-hidden rounded-full bg-outline-variant/30">
                      <View
                        className={`h-full rounded-full ${
                          isFull
                            ? 'bg-error'
                            : occupancy > 80
                            ? 'bg-status-warning'
                            : 'bg-status-active'
                        }`}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </View>
                  </View>

                  {pen.description ? (
                    <Text className="mt-2 text-caption text-on-surface-variant">
                      {pen.description}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

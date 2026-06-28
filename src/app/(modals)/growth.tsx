// ─────────────────────────────────────────────────────────
// Form Catat Penimbangan — modal form sesuai stitch design
// ─────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGrowthRecord } from '@/services/growth';
import type { CreateGrowthRecordInput } from '@/types/growth';

// ── Helpers ──

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Screen ──

export default function GrowthFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
    lastWeight = '0',
    status = 'active',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    lastWeight: string;
    status: string;
  }>();

  const lastWeightNum = parseFloat(lastWeight) || 0;

  // ── Form state ──
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [height, setHeight] = useState('');
  const [bcs, setBcs] = useState(3);
  const [chestGirth, setChestGirth] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── ADG live preview ──
  const adgPreview = useMemo(() => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0 || lastWeightNum <= 0) return null;

    const diffKg = w - lastWeightNum;
    const diffGram = diffKg * 1000;
    // Estimate: assume 14 days since last weighing
    const daysSinceLast = 14;
    const adgGramPerDay = Math.round(diffGram / daysSinceLast);

    return {
      value: adgGramPerDay,
      isPositive: adgGramPerDay >= 0,
      text: `${adgGramPerDay >= 0 ? '+' : ''}${adgGramPerDay}g/hari`,
      subtext: `Sejak ${daysSinceLast} hari lalu`,
    };
  }, [weight, lastWeightNum]);

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const w = parseFloat(weight);

    if (!weight || isNaN(w) || w <= 0) {
      newErrors.weight = 'Berat badan wajib diisi';
    }
    if (bcs < 1 || bcs > 5) {
      newErrors.bcs = 'BCS harus antara 1-5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [weight, bcs]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createGrowthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: () => {
      setErrors({ submit: 'Gagal menyimpan data. Coba lagi.' });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: CreateGrowthRecordInput = {
      livestock_id: livestockId!,
      record_date: toISODate(date),
      weight_kg: parseFloat(weight),
      bcs,
      ...(height ? { height_cm: parseFloat(height) } : {}),
      ...(chestGirth ? { chest_girth_cm: parseFloat(chestGirth) } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    mutation.mutate(input);
  }, [validate, livestockId, date, weight, bcs, height, chestGirth, notes, mutation]);

  const onDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  }, []);

  const statusLabel =
    status === 'active'
      ? 'Sehat'
      : status === 'sick'
        ? 'Sakit'
        : status === 'quarantine'
          ? 'Karantina'
          : status;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* ── Top App Bar ── */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
          </Pressable>
          <Text className="font-headline text-headline-md font-bold text-primary">Catat Penimbangan</Text>
        </View>
        <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest">
          <MaterialCommunityIcons name="account" size={22} color="#0F5238" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Identity Card ── */}
        <View className="mb-6 flex-row items-center justify-between rounded-xl border-l-4 border-primary bg-surface p-md shadow-sm">
          <View>
            <View className="self-start rounded bg-primary-fixed px-2 py-0.5">
              <Text className="font-mono text-id-monospace text-primary">#{earTag}</Text>
            </View>
            <Text className="mt-xs text-body-md text-on-surface-variant">
              Terakhir:{' '}
              <Text className="font-bold text-on-surface">{lastWeightNum.toFixed(1)} kg</Text>
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-status-active/10 px-3 py-1">
            <View className="h-2 w-2 rounded-full bg-status-active" />
            <Text className="text-label-md font-medium text-status-active">{statusLabel}</Text>
          </View>
        </View>

        {/* ── Form ── */}
        <View className="gap-md">
          {/* Berat Badan + ADG preview */}
          <View className="gap-sm">
            <View className="flex-row items-end justify-between">
              <Text className="text-label-md font-medium text-on-surface-variant">Berat Badan</Text>
              <Text className="text-caption text-secondary">ADG Target: &gt;100g/hari</Text>
            </View>
            <View className="relative">
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor="#BFC9C1"
                className="h-14 rounded-xl border-2 border-outline-variant bg-surface px-md pr-12 text-headline-md font-semibold text-on-surface focus:border-primary"
              />
              <Text className="absolute right-md top-1/2 -translate-y-1/2 text-body-lg font-bold text-on-surface-variant">
                kg
              </Text>
            </View>
            {errors.weight && (
              <Text className="text-caption text-error">{errors.weight}</Text>
            )}

            {/* ADG Live Preview */}
            {adgPreview ? (
              <View
                className={`flex-row items-center justify-between rounded-xl p-md ${
                  adgPreview.isPositive
                    ? 'border border-primary-fixed bg-brand-surface'
                    : 'border border-error-container bg-error-container'
                }`}
              >
                <View className="flex-row items-center gap-sm">
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={20}
                    color={adgPreview.isPositive ? '#0F5238' : '#BA1A1A'}
                  />
                  <Text
                    className={`font-medium text-body-md ${
                      adgPreview.isPositive ? 'text-primary' : 'text-error'
                    }`}
                  >
                    Pertumbuhan (ADG)
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`text-headline-sm font-semibold ${
                      adgPreview.isPositive ? 'text-primary' : 'text-error'
                    }`}
                  >
                    {adgPreview.text}
                  </Text>
                  <Text className="text-caption text-on-surface-variant">{adgPreview.subtext}</Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low p-md">
                <View className="flex-row items-center gap-sm">
                  <MaterialCommunityIcons name="trending-up" size={20} color="#707973" />
                  <Text className="text-body-md text-on-surface-variant">Pertumbuhan (ADG)</Text>
                </View>
                <Text className="text-headline-sm font-semibold text-on-surface-variant">--- g/hari</Text>
              </View>
            )}
          </View>

          {/* Tanggal + Tinggi Badan — side by side */}
          <View className="flex-row gap-md">
            <View className="flex-1 gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Tanggal</Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="h-12 items-start justify-center rounded-xl border border-outline-variant bg-surface px-md"
              >
                <Text className="text-body-md text-on-surface">{formatDisplayDate(date)}</Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onDateChange}
                />
              )}
            </View>
            <View className="flex-1 gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Tinggi Badan</Text>
              <View className="relative">
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#BFC9C1"
                  className="h-12 rounded-xl border border-outline-variant bg-surface px-md pr-10 text-body-md text-on-surface focus:border-primary"
                />
                <Text className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-on-surface-variant">
                  cm
                </Text>
              </View>
            </View>
          </View>

          {/* BCS Selector */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Body Condition Score (BCS)</Text>
            <View className="flex-row items-center rounded-full border border-outline-variant bg-surface-container-low p-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <Pressable
                  key={val}
                  onPress={() => setBcs(val)}
                  className={`flex-1 items-center justify-center rounded-full py-2.5 ${
                    bcs === val ? 'bg-primary-container' : ''
                  }`}
                >
                  <Text
                    className={`text-label-md font-medium ${
                      bcs === val ? 'font-bold text-on-primary-container' : 'text-on-surface-variant'
                    }`}
                  >
                    {val}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row justify-between px-2">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-outline">Kurang</Text>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-outline">Ideal</Text>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-outline">Gemuk</Text>
            </View>
          </View>

          {/* Lingkar Dada */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Lingkar Dada</Text>
            <View className="relative">
              <TextInput
                value={chestGirth}
                onChangeText={setChestGirth}
                keyboardType="number-pad"
                placeholder="Masukkan ukuran"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface px-md pr-10 text-body-md text-on-surface focus:border-primary"
              />
              <Text className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-on-surface-variant">
                cm
              </Text>
            </View>
          </View>

          {/* Catatan */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Catatan</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Contoh: Kondisi bulu sehat, nafsu makan tinggi..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-xl border border-outline-variant bg-surface p-md text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
          </View>

          {/* Submit error */}
          {errors.submit && (
            <View className="flex-row items-center gap-2 rounded-xl border border-error-container bg-error-container/30 p-3">
              <MaterialCommunityIcons name="alert-circle" size={18} color="#BA1A1A" />
              <Text className="flex-1 text-body-sm text-error">{errors.submit}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={onSubmit}
            disabled={mutation.isPending}
            className={`h-14 flex-row items-center justify-center gap-2 rounded-xl shadow-lg active:scale-[0.98] ${
              mutation.isPending ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
            )}
            <Text className="text-headline-sm font-bold text-on-primary">
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Rekaman'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

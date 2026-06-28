// ─────────────────────────────────────────────────────────
// Form Clearance Karantina — sesuai stitch design
// ─────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, TextInput, View, Text, Switch, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { submitClearance } from '@/services/quarantine';
import { usePens } from '@/hooks/useLivestock';
import type { ClearanceTestResult } from '@/types/quarantine';

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

function daysSince(isoDate: string): number {
  const start = new Date(isoDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Main Screen ──

export default function ClearanceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    quarantineId,
    earTag = '',
    animalName = '',
    startDate = '',
    durationDays = '14',
    penCode = '',
  } = useLocalSearchParams<{
    quarantineId: string;
    earTag: string;
    animalName: string;
    startDate: string;
    durationDays: string;
    penCode: string;
  }>();

  const { data: pens = [] } = usePens();

  const availablePens = useMemo(
    () => pens.filter((p) => p.is_active && p.current_count < p.capacity),
    [pens],
  );

  const daysElapsed = useMemo(() => (startDate ? daysSince(startDate) : 0), [startDate]);
  const totalDays = parseInt(durationDays) || 14;

  // ── Form state ──
  const [clearanceDate, setClearanceDate] = useState(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [testResult, setTestResult] = useState<ClearanceTestResult>('negative');
  const [returnPenId, setReturnPenId] = useState('');
  const [showPenDropdown, setShowPenDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isNegative = testResult === 'negative';

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (testDone && isNegative && !returnPenId) {
      newErrors.pen = 'Pilih kandang tujuan untuk ternak yang sudah bersih';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [testDone, isNegative, returnPenId]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: () =>
      submitClearance(quarantineId!, {
        clearance_test_result: testDone ? testResult : 'negative',
        clearance_date: toISODate(clearanceDate),
        ...(testDone && isNegative && returnPenId ? { return_pen_id: returnPenId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: () => {
      setErrors({ submit: 'Gagal memproses clearance. Coba lagi.' });
    },
  });

  const onFinishClearance = useCallback(() => {
    if (!validate()) return;
    mutation.mutate();
  }, [validate, mutation]);

  const onDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatepicker(Platform.OS === 'ios');
    if (selectedDate) setClearanceDate(selectedDate);
  }, []);

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
            <MaterialCommunityIcons name="arrow-left" size={24} color="#707973" />
          </Pressable>
          <Text className="font-headline text-headline-md text-primary">Clearance Karantina</Text>
        </View>
        <MaterialCommunityIcons name="shield-check" size={22} color="#0F5238" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Animal Profile Card ── */}
        <View className="mb-6 rounded-3xl border-l-4 border-status-quarantine bg-surface-container-lowest p-lg shadow-sm">
          <View className="mb-4 flex-row items-start justify-between">
            <View>
              <Text className="font-headline text-headline-md text-on-surface">{animalName}</Text>
              <View className="mt-1 self-start rounded-lg bg-primary-fixed px-2 py-0.5">
                <Text className="font-mono text-id-monospace text-primary">#{earTag}</Text>
              </View>
            </View>
            <View className="items-end">
              <View className="flex-row items-center gap-1.5 rounded-full bg-status-quarantine/10 px-3 py-1">
                <View className="h-2 w-2 rounded-full bg-status-quarantine" />
                <Text className="font-label-md font-bold uppercase text-status-quarantine">Dalam Karantina</Text>
              </View>
              <Text className="mt-1 text-caption text-on-surface-variant">
                Hari {daysElapsed} dari {totalDays}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-md border-t border-outline-variant pt-4">
            <View className="flex-1">
              <Text className="text-caption text-on-surface-variant">Terakhir Diperiksa</Text>
              <Text className="mt-0.5 text-body-md text-on-surface">
                {startDate ? formatDisplayDate(new Date(startDate)) : '-'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-caption text-on-surface-variant">Kandang Isolasi</Text>
              <Text className="mt-0.5 text-body-md text-on-surface">{penCode || '-'}</Text>
            </View>
          </View>
        </View>

        {/* ── Form ── */}
        <View className="gap-lg rounded-3xl bg-surface-container-lowest p-lg shadow-sm">
          {/* Clearance Date */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">Tanggal Clearance</Text>
            <Pressable
              onPress={() => setShowDatepicker(true)}
              className="h-[48px] flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface px-md"
            >
              <Text className="text-body-md text-on-surface">{formatDisplayDate(clearanceDate)}</Text>
              <MaterialCommunityIcons name="calendar-today" size={18} color="#404943" />
            </Pressable>
            {showDatepicker && (
              <DateTimePicker
                value={clearanceDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Disease Test Toggle */}
          <View className="flex-row items-center justify-between rounded-2xl border border-brand-light bg-brand-surface p-md">
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons name="flask" size={22} color="#0F5238" />
              <View>
                <Text className="font-headline text-headline-sm text-on-surface">Uji Bebas Penyakit</Text>
                <Text className="text-caption text-on-surface-variant">Verifikasi laboratorium diperlukan</Text>
              </View>
            </View>
            <Switch
              value={testDone}
              onValueChange={setTestDone}
              trackColor={{ false: '#BFC9C1', true: '#0F5238' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Test Results (conditional) */}
          {testDone && (
            <View className="gap-lg">
              {/* Test Result Radio */}
              <View className="gap-sm">
                <Text className="text-label-md font-medium text-on-surface-variant ml-1">Hasil Uji</Text>
                <View className="flex-row gap-4">
                  <Pressable
                    onPress={() => setTestResult('negative')}
                    className={`flex-1 h-[48px] items-center justify-center rounded-xl border ${
                      testResult === 'negative'
                        ? 'border-status-active bg-status-active/10'
                        : 'border-outline-variant'
                    }`}
                  >
                    <Text
                      className={`font-label-md font-bold ${
                        testResult === 'negative' ? 'text-status-active' : 'text-on-surface-variant'
                      }`}
                    >
                      NEGATIF
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setTestResult('positive')}
                    className={`flex-1 h-[48px] items-center justify-center rounded-xl border ${
                      testResult === 'positive'
                        ? 'border-status-quarantine bg-status-quarantine/10'
                        : 'border-outline-variant'
                    }`}
                  >
                    <Text
                      className={`font-label-md font-bold ${
                        testResult === 'positive' ? 'text-status-quarantine' : 'text-on-surface-variant'
                      }`}
                    >
                      POSITIF
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Return Pen (only on negative) */}
              {isNegative && (
                <View className="gap-sm">
                  <Text className="text-label-md font-medium text-on-surface-variant ml-1">Pilih Kandang Tujuan</Text>
                  <View className="relative">
                    <Pressable
                      onPress={() => setShowPenDropdown((v) => !v)}
                      className="flex-row items-center h-[48px] rounded-xl border border-outline-variant bg-surface px-md"
                    >
                      <Text
                        className={`flex-1 text-body-md ${
                          returnPenId ? 'text-on-surface' : 'text-outline-variant'
                        }`}
                      >
                        {returnPenId
                          ? (() => {
                              const pen = pens.find((p) => p._id === returnPenId);
                              return pen ? `${pen.pen_code} — ${pen.pen_type}` : 'Pilih kandang';
                            })()
                          : 'Pilih kandang'}
                      </Text>
                      <MaterialCommunityIcons
                        name={showPenDropdown ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#707973"
                      />
                    </Pressable>

                    {showPenDropdown && (
                      <View className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 rounded-xl border border-outline-variant bg-white shadow-lg">
                        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                          {availablePens.map((pen) => (
                            <Pressable
                              key={pen._id}
                              onPress={() => {
                                setReturnPenId(pen._id);
                                setShowPenDropdown(false);
                              }}
                              className="border-b border-outline-variant/50 px-4 py-3 active:bg-surface-container-low"
                            >
                              <Text className="text-body-md text-on-surface">{pen.pen_code}</Text>
                              <Text className="text-caption text-on-surface-variant">
                                {pen.pen_type} · {pen.capacity - pen.current_count} tersedia
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  <Text className="text-caption text-on-surface-variant flex-row items-center gap-1">
                    <MaterialCommunityIcons name="information-outline" size={14} color="#707973" />{' '}
                    Hanya kandang dengan kapasitas tersedia yang ditampilkan.
                  </Text>
                  {errors.pen && <Text className="text-caption text-error">{errors.pen}</Text>}
                </View>
              )}

              {/* Positive result message */}
              {!isNegative && (
                <View className="rounded-xl border border-status-quarantine/20 bg-status-quarantine/5 p-4">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons name="alert-circle" size={18} color="#E63946" />
                    <Text className="text-body-md font-medium text-status-quarantine">
                      Hasil positif — ternak tetap di karantina
                    </Text>
                  </View>
                  <Text className="mt-1 text-caption text-on-surface-variant">
                    Status karantina akan diperpanjang. Tidak ada perubahan status ternak.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Notes */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">
              Catatan Tambahan
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Deskripsikan kondisi fisik, nafsu makan, atau perubahan perilaku..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-xl border border-outline-variant bg-surface p-md text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit error */}
        {errors.submit && (
          <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-error-container bg-error-container/30 p-3">
            <MaterialCommunityIcons name="alert-circle" size={18} color="#BA1A1A" />
            <Text className="flex-1 text-body-sm text-error">{errors.submit}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Action Buttons ── */}
      <View className="gap-3 border-t border-outline-variant/30 bg-surface-container-lowest px-gutter py-md">
        <Pressable
          onPress={onFinishClearance}
          disabled={mutation.isPending}
          className={`h-[48px] flex-row items-center justify-center gap-2 rounded-xl shadow-lg active:scale-[0.98] ${
            mutation.isPending ? 'bg-primary/60' : 'bg-primary'
          }`}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
          )}
          <Text className="text-headline-sm font-bold text-on-primary">
            {mutation.isPending ? 'Memproses...' : 'Selesaikan Clearance'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          className="h-[48px] flex-row items-center justify-center gap-2 rounded-xl border-2 border-primary active:scale-[0.98]"
        >
          <Text className="text-headline-sm font-bold text-primary">Pantau Terus</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

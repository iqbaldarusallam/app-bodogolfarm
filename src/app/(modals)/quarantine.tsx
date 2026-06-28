// ─────────────────────────────────────────────────────────
// Form Mulai Karantina — sesuai stitch design
// ─────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { createQuarantine } from '@/services/quarantine';
import { usePens } from '@/hooks/useLivestock';
import type { CreateQuarantineInput } from '@/types/quarantine';

// ── Helpers ──

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Screen ──

export default function QuarantineFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
    animalName = '',
    healthRecordId = '',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    animalName: string;
    healthRecordId: string;
  }>();

  const { data: pens = [] } = usePens();

  const availablePens = useMemo(
    () => pens.filter((p) => p.is_active && p.current_count < p.capacity),
    [pens],
  );

  // ── Form state ──
  const [diseaseSuspected, setDiseaseSuspected] = useState('');
  const [selectedPenId, setSelectedPenId] = useState('');
  const [showPenDropdown, setShowPenDropdown] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [durationDays, setDurationDays] = useState('14');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Computed end date ──
  const endDate = useMemo(() => {
    const d = parseInt(durationDays);
    return isNaN(d) ? startDate : addDays(startDate, d);
  }, [startDate, durationDays]);

  const selectedPen = useMemo(
    () => pens.find((p) => p._id === selectedPenId),
    [pens, selectedPenId],
  );

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!diseaseSuspected.trim()) newErrors.disease = 'Penyakit dicurigai wajib diisi';
    if (!selectedPenId) newErrors.pen = 'Kandang karantina wajib dipilih';
    if (!healthRecordId) newErrors.health = 'Data kesehatan asal diperlukan';
    if (!reason.trim()) newErrors.reason = 'Alasan karantina wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [diseaseSuspected, selectedPenId, healthRecordId, reason]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createQuarantine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: () => {
      setErrors({ submit: 'Gagal memulai karantina. Coba lagi.' });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: CreateQuarantineInput = {
      livestock_id: livestockId!,
      health_record_id: healthRecordId,
      quarantine_pen_id: selectedPenId,
      start_date: toISODate(startDate),
      expected_duration_days: parseInt(durationDays),
      reason: reason.trim(),
      disease_suspected: diseaseSuspected.trim(),
      notes: reason.trim(),
    };

    mutation.mutate(input);
  }, [
    validate, livestockId, healthRecordId, selectedPenId, startDate,
    durationDays, reason, diseaseSuspected, mutation,
  ]);

  const onStartChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* ── Top AppBar ── */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F5238" />
          </Pressable>
          <Text className="font-headline text-headline-md font-bold text-primary">Mulai Karantina</Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary-fixed">
          <MaterialCommunityIcons name="account" size={20} color="#0F5238" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Warning Banner ── */}
        <View className="mb-4 flex-row gap-3 rounded-xl border-l-4 border-status-quarantine bg-error-container p-md shadow-sm">
          <MaterialCommunityIcons name="alert" size={24} color="#BA1A1A" />
          <View className="flex-1">
            <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-on-error-container">
              Penyakit Dicurigai Menular
            </Text>
            <Text className="mt-1 text-body-md text-on-surface-variant opacity-90">
              Segera pisahkan ternak yang menunjukkan gejala klinis untuk mencegah penyebaran lebih luas di area peternakan.
            </Text>
          </View>
        </View>

        {/* ── Animal Quick Info ── */}
        <View className="mb-6 flex-row items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <View className="h-16 w-16 items-center justify-center rounded-lg bg-surface-muted">
            <MaterialCommunityIcons name="paw" size={28} color="#0F5238" />
          </View>
          <View>
            <View className="flex-row items-center gap-sm">
              <View className="rounded bg-primary-fixed px-2 py-0.5">
                <Text className="font-mono text-[11px] font-bold uppercase text-primary">ID: {earTag}</Text>
              </View>
              <View className="rounded-full border border-status-sick/20 bg-status-sick/10 px-2 py-0.5">
                <Text className="text-label-md font-bold uppercase text-status-sick">Sakit</Text>
              </View>
            </View>
            <Text className="mt-1 font-headline text-headline-md text-on-surface">{animalName}</Text>
          </View>
        </View>

        <View className="gap-lg">
          {/* ── Penyakit Dicurigai ── */}
          <View className="gap-1">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Penyakit Dicurigai</Text>
            <View className="relative">
              <MaterialCommunityIcons
                name="stethoscope"
                size={20}
                color="#707973"
                className="absolute left-4 top-3.5"
              />
              <TextInput
                value={diseaseSuspected}
                onChangeText={setDiseaseSuspected}
                placeholder="Contoh: PMK atau LSD"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest pl-12 pr-4 text-body-md text-on-surface focus:border-primary"
              />
            </View>
            {errors.disease && <Text className="text-caption text-error">{errors.disease}</Text>}
          </View>

          {/* ── Kandang Karantina ── */}
          <View className="gap-1">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Kandang Karantina</Text>
            <View className="relative">
              <MaterialCommunityIcons
                name="door"
                size={20}
                color="#707973"
                className="absolute left-4 top-3.5"
              />
              <Pressable
                onPress={() => setShowPenDropdown((v) => !v)}
                className="flex-row items-center h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest pl-12 pr-10"
              >
                <Text
                  className={`flex-1 text-body-md ${
                    selectedPen ? 'text-on-surface' : 'text-outline-variant'
                  }`}
                >
                  {selectedPen
                    ? `${selectedPen.pen_code} — ${selectedPen.pen_type}`
                    : 'Pilih Lokasi Karantina'}
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
                    {availablePens.length === 0 ? (
                      <View className="px-4 py-3">
                        <Text className="text-body-md text-on-surface-variant">Tidak ada kandang tersedia</Text>
                      </View>
                    ) : (
                      availablePens.map((pen) => {
                        const available = pen.capacity - pen.current_count;
                        return (
                          <Pressable
                            key={pen._id}
                            onPress={() => {
                              setSelectedPenId(pen._id);
                              setShowPenDropdown(false);
                            }}
                            className="border-b border-outline-variant/50 px-4 py-3 active:bg-surface-container-low"
                          >
                            <View className="flex-row items-center justify-between">
                              <View>
                                <Text className="text-body-md text-on-surface">{pen.pen_code}</Text>
                                <Text className="text-caption text-on-surface-variant">{pen.pen_type}</Text>
                              </View>
                              <View className="flex-row items-center gap-1">
                                <View className="h-2 w-2 rounded-full bg-status-active" />
                                <Text className="text-caption text-on-surface-variant">
                                  {available}/{pen.capacity}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
            {/* Capacity info */}
            <View className="flex-row items-center justify-between px-1 mt-1">
              <View className="flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full bg-status-active" />
                <Text className="text-caption text-on-surface-variant">
                  Kapasitas Tersedia: {selectedPen ? `${selectedPen.capacity - selectedPen.current_count}/${selectedPen.capacity}` : `${availablePens.length} kandang`}
                </Text>
              </View>
            </View>
            {errors.pen && <Text className="text-caption text-error">{errors.pen}</Text>}
          </View>

          {/* ── Tanggal Mulai + Durasi ── */}
          <View className="flex-row gap-md">
            <View className="flex-1 gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">Tanggal Mulai</Text>
              <Pressable
                onPress={() => setShowStartPicker(true)}
                className="h-[48px] flex-row items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4"
              >
                <MaterialCommunityIcons name="calendar-today" size={18} color="#707973" />
                <Text className="ml-3 text-body-md text-on-surface">{formatDisplayDate(startDate)}</Text>
              </Pressable>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onStartChange}
                />
              )}
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">Durasi (Hari)</Text>
              <View className="relative">
                <MaterialCommunityIcons
                  name="timer"
                  size={18}
                  color="#707973"
                  className="absolute left-4 top-3"
                />
                <TextInput
                  value={durationDays}
                  onChangeText={setDurationDays}
                  keyboardType="number-pad"
                  placeholder="14"
                  placeholderTextColor="#BFC9C1"
                  className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest pl-12 pr-4 text-body-md text-on-surface"
                />
              </View>
            </View>
          </View>

          {/* ── Estimasi Selesai Card ── */}
          <View className="flex-row items-center justify-between rounded-xl border border-dashed border-outline-variant bg-surface-muted p-md">
            <View className="flex-row items-center gap-sm">
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#707973" />
              <Text className="text-body-md text-on-surface">Estimasi Selesai:</Text>
            </View>
            <Text className="font-headline text-headline-sm font-semibold text-primary">
              {formatDisplayDate(endDate)}
            </Text>
          </View>

          {/* ── Alasan / Catatan Klinis ── */}
          <View className="gap-1">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">
              Alasan / Catatan Klinis
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              placeholder="Deskripsikan gejala atau instruksi penanganan khusus..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[100px] rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
            {errors.reason && <Text className="text-caption text-error">{errors.reason}</Text>}
          </View>

          {/* Health record error */}
          {errors.health && (
            <View className="flex-row items-center gap-2 rounded-xl border border-error-container bg-error-container/30 p-3">
              <MaterialCommunityIcons name="alert-circle" size={18} color="#BA1A1A" />
              <Text className="flex-1 text-body-sm text-error">{errors.health}</Text>
            </View>
          )}
        </View>

        {/* Submit error */}
        {errors.submit && (
          <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-error-container bg-error-container/30 p-3">
            <MaterialCommunityIcons name="alert-circle" size={18} color="#BA1A1A" />
            <Text className="flex-1 text-body-sm text-error">{errors.submit}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Fixed Bottom ── */}
      <View className="border-t border-outline-variant/30 bg-surface-container-lowest px-gutter py-md gap-3">
        <Pressable
          onPress={onSubmit}
          disabled={mutation.isPending}
          className={`h-14 flex-row items-center justify-center gap-2 rounded-xl shadow-lg active:scale-[0.98] ${
            mutation.isPending ? 'bg-status-quarantine/60' : 'bg-status-quarantine'
          }`}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="shield-lock" size={20} color="#FFFFFF" />
          )}
          <Text className="text-headline-sm font-bold text-on-primary">
            {mutation.isPending ? 'Memproses...' : 'Mulai Karantina'}
          </Text>
        </Pressable>
        <View className="flex-row items-center justify-center gap-2">
          <MaterialCommunityIcons name="bell-ring" size={14} color="#707973" />
          <Text className="flex-1 text-center text-caption italic text-on-surface-variant">
            Notifikasi akan dikirim ke semua petugas medis dan pengelola sektor.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// Form Catat Pengobatan — sesuai stitch design
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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { createMedicationLog } from '@/services/medication';
import type {
  CreateMedicationLogInput,
  MedicationType,
  DosageUnit,
  MedicationRoute,
} from '@/types/medication';

// ── Constants ──

const MEDICATION_TYPES: { key: MedicationType; label: string }[] = [
  { key: 'treatment', label: 'Pengobatan' },
  { key: 'vitamin', label: 'Vitamin' },
  { key: 'antiparasitic', label: 'Anti-P' },
];

const DOSAGE_UNITS: { key: DosageUnit; label: string }[] = [
  { key: 'ml', label: 'ml' },
  { key: 'mg', label: 'mg' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'sachet', label: 'Bolus' },
];

const ROUTE_OPTIONS: { key: MedicationRoute; label: string }[] = [
  { key: 'injeksi_IM', label: 'IM (Intramuscular)' },
  { key: 'injeksi_SC', label: 'SC (Subcutaneous)' },
  { key: 'oral', label: 'Oral' },
  { key: 'topikal', label: 'Topikal' },
  { key: 'injeksi_IV', label: 'IV (Intravena)' },
];

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

export default function MedicationFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
    healthRecordId = '',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    healthRecordId: string;
  }>();

  // ── Form state ──
  const [medType, setMedType] = useState<MedicationType>('treatment');
  const [medicineName, setMedicineName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState<DosageUnit>('ml');
  const [route, setRoute] = useState<MedicationRoute>('injeksi_IM');
  const [frequency, setFrequency] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [withdrawalDays, setWithdrawalDays] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [initialResponse, setInitialResponse] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Computed end date & withdrawal ──
  const endDate = useMemo(() => {
    const d = parseInt(durationDays);
    return isNaN(d) ? startDate : addDays(startDate, d);
  }, [startDate, durationDays]);

  const withdrawalEndDate = useMemo(() => {
    const w = parseInt(withdrawalDays);
    return isNaN(w) || w <= 0 ? null : addDays(endDate, w);
  }, [endDate, withdrawalDays]);

  const showWithdrawal = medType === 'treatment';

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const d = parseFloat(dosage);
    const dur = parseInt(durationDays);

    if (!medicineName.trim()) newErrors.name = 'Nama obat wajib diisi';
    if (!dosage || isNaN(d) || d <= 0) newErrors.dosage = 'Dosis wajib diisi';
    if (!durationDays || isNaN(dur) || dur < 1) newErrors.duration = 'Durasi minimal 1 hari';
    if (showWithdrawal && (!withdrawalDays || parseInt(withdrawalDays) < 0)) {
      newErrors.withdrawal = 'Masa henti obat wajib diisi untuk pengobatan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [medicineName, dosage, durationDays, withdrawalDays, showWithdrawal]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createMedicationLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication'] });
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: () => {
      setErrors({ submit: 'Gagal menyimpan data. Coba lagi.' });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: CreateMedicationLogInput = {
      ...(healthRecordId ? { health_record_id: healthRecordId } : {}),
      livestock_id: livestockId!,
      medication_type: medType,
      medicine_name: medicineName.trim(),
      dosage: parseFloat(dosage),
      dosage_unit: dosageUnit,
      route,
      frequency: frequency.trim() || '1x sehari',
      duration_days: parseInt(durationDays),
      start_date: toISODate(startDate),
      end_date: toISODate(endDate),
      ...(activeIngredient.trim() ? { active_ingredient: activeIngredient.trim() } : {}),
      ...(showWithdrawal && withdrawalDays ? { withdrawal_period_days: parseInt(withdrawalDays) } : {}),
      ...(batchNumber.trim() ? { batch_number: batchNumber.trim() } : {}),
      ...(initialResponse ? { response: 'improving' } : {}),
    };

    mutation.mutate(input);
  }, [
    validate, healthRecordId, livestockId, medType, medicineName,
    dosage, dosageUnit, route, frequency, durationDays, startDate,
    endDate, activeIngredient, showWithdrawal, withdrawalDays,
    batchNumber, initialResponse, mutation,
  ]);

  const onStartDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
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
          <Text className="font-headline text-headline-md font-bold text-primary">Catat Pengobatan</Text>
        </View>
        {healthRecordId ? (
          <View className="flex-row items-center gap-1.5 rounded-full bg-status-sick/10 px-3 py-1">
            <MaterialCommunityIcons name="stethoscope" size={16} color="#F4A261" />
            <Text className="text-label-md font-medium text-status-sick">Health #{earTag}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-lg">
          {/* ── Tipe Obat (Pill Toggle) ── */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">Tipe Obat</Text>
            <View className="flex-row rounded-full bg-surface-container p-1 gap-1">
              {MEDICATION_TYPES.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setMedType(opt.key)}
                  className={`flex-1 items-center rounded-full py-1.5 ${
                    medType === opt.key ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Text
                    className={`text-label-md font-medium ${
                      medType === opt.key ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Nama Obat ── */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">Nama Obat</Text>
            <View className="relative">
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#707973"
                className="absolute left-3 top-3"
              />
              <TextInput
                value={medicineName}
                onChangeText={setMedicineName}
                placeholder="Cari nama obat..."
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-md text-on-surface focus:border-primary"
              />
            </View>
            {errors.name && <Text className="text-caption text-error">{errors.name}</Text>}
          </View>

          {/* ── Zat Aktif ── */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">Zat Aktif</Text>
            <TextInput
              value={activeIngredient}
              onChangeText={setActiveIngredient}
              placeholder="e.g. Oxytetracycline"
              placeholderTextColor="#BFC9C1"
              className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
            />
          </View>

          {/* ── Dosis + Satuan ── */}
          <View className="flex-row gap-md">
            <View className="flex-1 gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant ml-1">Dosis</Text>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
              />
              {errors.dosage && <Text className="text-caption text-error">{errors.dosage}</Text>}
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant ml-1">Satuan</Text>
              <View className="flex-row gap-1">
                {DOSAGE_UNITS.map((u) => (
                  <Pressable
                    key={u.key}
                    onPress={() => setDosageUnit(u.key)}
                    className={`flex-1 items-center justify-center rounded-lg border py-3 ${
                      dosageUnit === u.key
                        ? 'border-primary-container bg-primary-container'
                        : 'border-outline-variant bg-surface-container-lowest'
                    }`}
                  >
                    <Text
                      className={`text-label-md font-medium ${
                        dosageUnit === u.key ? 'text-on-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      {u.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* ── Rute Pemberian ── */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">Rute Pemberian</Text>
            <View className="flex-row flex-wrap gap-2">
              {ROUTE_OPTIONS.map((r) => (
                <Pressable
                  key={r.key}
                  onPress={() => setRoute(r.key)}
                  className={`rounded-lg border px-4 py-3 ${
                    route === r.key
                      ? 'border-primary bg-primary/10'
                      : 'border-outline-variant bg-surface-container-lowest'
                  }`}
                >
                  <Text
                    className={`text-body-md ${
                      route === r.key ? 'font-medium text-primary' : 'text-on-surface'
                    }`}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Frekuensi + Durasi ── */}
          <View className="flex-row gap-md">
            <View className="flex-1 gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant ml-1">Frekuensi</Text>
              <TextInput
                value={frequency}
                onChangeText={setFrequency}
                placeholder="e.g. 1x Sehari"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant ml-1">Durasi (Hari)</Text>
              <TextInput
                value={durationDays}
                onChangeText={setDurationDays}
                keyboardType="number-pad"
                placeholder="3"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
              />
              {errors.duration && <Text className="text-caption text-error">{errors.duration}</Text>}
            </View>
          </View>

          {/* ── Tanggal Mulai ── */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">Tanggal Mulai</Text>
            <Pressable
              onPress={() => setShowStartDatePicker(true)}
              className="h-12 flex-row items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4"
            >
              <MaterialCommunityIcons name="calendar-today" size={18} color="#707973" />
              <Text className="ml-3 text-body-md text-on-surface">{formatDisplayDate(startDate)}</Text>
            </Pressable>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onStartDateChange}
              />
            )}
          </View>

          {/* ── Withdrawal Card ── */}
          {showWithdrawal && (
            <View className="rounded-xl border-l-4 border-status-quarantine bg-error-container/20 p-md shadow-sm gap-md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-sm">
                  <MaterialCommunityIcons name="alert" size={18} color="#E63946" />
                  <Text className="text-label-md font-bold tracking-wider text-on-error-container">
                    MASA HENTI OBAT
                  </Text>
                </View>
                <Text className="font-mono text-caption text-on-error-container">WITHDRAWAL PERIOD</Text>
              </View>
              <View className="flex-row items-center gap-md">
                <View className="flex-1 gap-1">
                  <Text className="text-caption text-on-surface-variant">Jumlah Hari Henti</Text>
                  <TextInput
                    value={withdrawalDays}
                    onChangeText={setWithdrawalDays}
                    keyboardType="number-pad"
                    placeholder="7"
                    placeholderTextColor="#BFC9C1"
                    className="h-10 rounded-lg border border-outline-variant bg-white px-4 text-body-md text-on-surface"
                  />
                </View>
                <View className="flex-[1.5] rounded-lg border border-status-quarantine/20 bg-white p-3">
                  <Text className="text-caption text-on-surface-variant">Estimasi Kelayakan:</Text>
                  <Text className="mt-1 text-headline-sm font-bold text-status-quarantine">
                    {withdrawalEndDate
                      ? `Aman jual/potong: ${formatDisplayDate(withdrawalEndDate)}`
                      : 'Masukkan hari henti'}
                  </Text>
                </View>
              </View>
              {errors.withdrawal && <Text className="text-caption text-error">{errors.withdrawal}</Text>}
            </View>
          )}

          {/* ── No. Batch / Lot ── */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant ml-1">No. Batch / Lot</Text>
            <TextInput
              value={batchNumber}
              onChangeText={setBatchNumber}
              placeholder="B-2023-XX-01"
              placeholderTextColor="#BFC9C1"
              className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-mono text-body-md text-on-surface focus:border-primary"
            />
          </View>

          {/* ── Respons Awal Baik ── */}
          <View className="flex-row items-center justify-between rounded-xl bg-surface-container px-4 py-3">
            <Text className="text-body-md font-medium text-on-surface">Respons Awal Baik?</Text>
            <Switch
              value={initialResponse}
              onValueChange={setInitialResponse}
              trackColor={{ false: '#BFC9C1', true: '#52B788' }}
              thumbColor="#FFFFFF"
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

      {/* ── Fixed Bottom Button ── */}
      <View className="border-t border-outline-variant/30 bg-surface-container-lowest px-gutter py-md">
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
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Rekam Medis'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

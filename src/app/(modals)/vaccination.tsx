// ─────────────────────────────────────────────────────────
// Form Catat Vaksinasi — sesuai stitch design
// ─────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { createVaccinationRecord } from '@/services/vaccination';
import { useVaccinationByLivestock } from '@/hooks/useLivestock';
import type { CreateVaccinationInput, VaccinationRoute } from '@/types/vaccination';

// ── Constants ──

const VACCINE_OPTIONS = [
  { key: 'aftopor', label: 'Aftopor (PMK)' },
  { key: 'septigen', label: 'Septigen (SE)' },
  { key: 'anthravax', label: 'Anthravax (Antraks)' },
  { key: 'brucellin', label: 'Brucellin' },
  { key: 'custom', label: 'Input Manual...' },
];

const ROUTE_OPTIONS: { key: VaccinationRoute; label: string; icon: string }[] = [
  { key: 'SC', label: 'Subkutan', icon: 'layers' },
  { key: 'IM', label: 'Intramuskular', icon: 'straighten' },
  { key: 'intranasal', label: 'Intranasal', icon: 'air' },
];

const BOOSTER_INTERVAL_DAYS = 90;

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

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Screen ──

export default function VaccinationFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
    animalName = '',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    animalName: string;
  }>();

  const { data: vaccinationRecords = [] } = useVaccinationByLivestock(livestockId ?? '');

  const lastVaccination = vaccinationRecords.length > 0
    ? formatShortDate(vaccinationRecords[0].vaccination_date)
    : null;

  // ── Form state ──
  const [vaccineName, setVaccineName] = useState('');
  const [isCustomVaccine, setIsCustomVaccine] = useState(false);
  const [customVaccineName, setCustomVaccineName] = useState('');
  const [diseaseTarget, setDiseaseTarget] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('ml');
  const [route, setRoute] = useState<VaccinationRoute>('SC');
  const [vaccinationDate, setVaccinationDate] = useState(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Booster date auto-calc ──
  const boosterDate = useMemo(
    () => addDays(vaccinationDate, BOOSTER_INTERVAL_DAYS),
    [vaccinationDate],
  );

  const finalVaccineName = isCustomVaccine ? customVaccineName : vaccineName;

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const d = parseFloat(dosage);

    if (!finalVaccineName.trim()) newErrors.vaccine = 'Nama vaksin wajib diisi';
    if (!diseaseTarget.trim()) newErrors.disease = 'Penyakit sasaran wajib diisi';
    if (!dosage || isNaN(d) || d <= 0) newErrors.dosage = 'Dosis wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [finalVaccineName, diseaseTarget, dosage]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createVaccinationRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccination'] });
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: () => {
      setErrors({ submit: 'Gagal menyimpan data. Coba lagi.' });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: CreateVaccinationInput = {
      livestock_id: livestockId!,
      vaccine_name: finalVaccineName.trim(),
      disease_target: diseaseTarget.trim(),
      dosage: parseFloat(dosage),
      dosage_unit: dosageUnit,
      route,
      vaccination_date: toISODate(vaccinationDate),
      booster_due_date: toISODate(boosterDate),
      ...(batchNumber.trim() ? { batch_number: batchNumber.trim() } : {}),
      ...(manufacturer.trim() ? { manufacturer: manufacturer.trim() } : {}),
    };

    mutation.mutate(input);
  }, [
    validate, livestockId, finalVaccineName, diseaseTarget, dosage,
    dosageUnit, route, vaccinationDate, boosterDate, batchNumber,
    manufacturer, mutation,
  ]);

  const onDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatepicker(Platform.OS === 'ios');
    if (selectedDate) setVaccinationDate(selectedDate);
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
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F5238" />
          </Pressable>
          <Text className="font-headline text-headline-md font-bold text-primary">Catat Vaksinasi</Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full">
          <MaterialCommunityIcons name="help-circle-outline" size={22} color="#404943" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Animal Quick Glance ── */}
        <View className="mb-6 flex-row items-center gap-md rounded-xl border-l-4 border-primary bg-surface-container-low p-md">
          <View className="h-16 w-16 items-center justify-center rounded-lg bg-surface-variant">
            <MaterialCommunityIcons name="paw" size={28} color="#0F5238" />
          </View>
          <View className="flex-1">
            <View className="self-start rounded bg-primary-fixed px-2 py-0.5">
              <Text className="font-mono text-[11px] font-bold uppercase text-primary">ID: {earTag}</Text>
            </View>
            <Text className="mt-1 font-headline text-headline-md text-on-surface">{animalName}</Text>
            {lastVaccination && (
              <Text className="mt-0.5 text-caption text-on-surface-variant">
                Terakhir Vaksin: {lastVaccination}
              </Text>
            )}
          </View>
        </View>

        {/* ── Section: Informasi Vaksin ── */}
        <View className="mb-6 gap-md">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="needle" size={20} color="#0F5238" />
            <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">
              Informasi Vaksin
            </Text>
          </View>

          {/* Nama Vaksin */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Nama Vaksin</Text>
            {isCustomVaccine ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={customVaccineName}
                  onChangeText={setCustomVaccineName}
                  placeholder="Nama vaksin..."
                  placeholderTextColor="#BFC9C1"
                  className="flex-1 h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
                />
                <Pressable
                  onPress={() => { setIsCustomVaccine(false); setVaccineName(''); }}
                  className="h-12 items-center justify-center rounded-xl bg-surface-container px-4"
                >
                  <MaterialCommunityIcons name="close" size={18} color="#707973" />
                </Pressable>
              </View>
            ) : (
              <View className="relative">
                <Pressable
                  onPress={() => {
                    // Simple selection: cycle through options
                    const currentIdx = VACCINE_OPTIONS.findIndex((v) => v.key === vaccineName);
                    const nextIdx = (currentIdx + 1) % VACCINE_OPTIONS.length;
                    const next = VACCINE_OPTIONS[nextIdx];
                    if (next.key === 'custom') {
                      setIsCustomVaccine(true);
                    } else {
                      setVaccineName(next.label);
                    }
                  }}
                  className="flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
                >
                  <Text
                    className={`text-body-md ${vaccineName ? 'text-on-surface' : 'text-outline-variant'}`}
                  >
                    {vaccineName || 'Pilih Vaksin'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={22} color="#707973" />
                </Pressable>
                {/* Simple option list */}
                <View className="mt-1 gap-1">
                  {VACCINE_OPTIONS.filter((v) => v.key !== 'custom').map((v) => (
                    <Pressable
                      key={v.key}
                      onPress={() => setVaccineName(v.label)}
                      className={`rounded-lg border px-4 py-2.5 ${
                        vaccineName === v.label
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      <Text
                        className={`text-body-md ${
                          vaccineName === v.label ? 'font-medium text-primary' : 'text-on-surface'
                        }`}
                      >
                        {v.label}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => setIsCustomVaccine(true)}
                    className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-2.5"
                  >
                    <Text className="text-body-md text-on-surface-variant">Input Manual...</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {errors.vaccine && <Text className="text-caption text-error">{errors.vaccine}</Text>}
          </View>

          {/* Penyakit Sasaran */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Penyakit Sasaran</Text>
            <TextInput
              value={diseaseTarget}
              onChangeText={setDiseaseTarget}
              placeholder="Contoh: PMK, Anthrax"
              placeholderTextColor="#BFC9C1"
              className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
            />
            {errors.disease && <Text className="text-caption text-error">{errors.disease}</Text>}
          </View>

          {/* No. Batch + Produsen */}
          <View className="flex-row gap-md">
            <View className="flex-1 gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">No. Batch</Text>
              <TextInput
                value={batchNumber}
                onChangeText={setBatchNumber}
                placeholder="B-2024-X"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">Produsen</Text>
              <TextInput
                value={manufacturer}
                onChangeText={setManufacturer}
                placeholder="Pusvetma"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
              />
            </View>
          </View>
        </View>

        {/* ── Section: Pemberian ── */}
        <View className="mb-6 gap-md">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="medical-bag" size={20} color="#0F5238" />
            <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">
              Pemberian
            </Text>
          </View>

          {/* Dosis & Satuan */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Dosis & Satuan</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                keyboardType="decimal-pad"
                placeholder="2.0"
                placeholderTextColor="#BFC9C1"
                className="flex-1 h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:border-primary"
              />
              <View className="flex-row gap-1">
                {['ml', 'cc', 'mg'].map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setDosageUnit(u)}
                    className={`h-12 items-center justify-center rounded-xl border px-3 ${
                      dosageUnit === u
                        ? 'border-primary bg-primary/10'
                        : 'border-outline-variant bg-surface-container-lowest'
                    }`}
                  >
                    <Text
                      className={`text-label-md font-medium ${
                        dosageUnit === u ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {errors.dosage && <Text className="text-caption text-error">{errors.dosage}</Text>}
          </View>

          {/* Cara Pemberian */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Cara Pemberian</Text>
            <View className="flex-row gap-2">
              {ROUTE_OPTIONS.map((r) => (
                <Pressable
                  key={r.key}
                  onPress={() => setRoute(r.key)}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                    route === r.key
                      ? 'border-primary bg-primary-fixed'
                      : 'border-outline-variant bg-surface-container-lowest'
                  }`}
                >
                  <MaterialCommunityIcons
                    name={r.icon as any}
                    size={18}
                    color={route === r.key ? '#0E5138' : '#404943'}
                  />
                  <Text
                    className={`text-label-md font-medium ${
                      route === r.key ? 'text-on-primary-fixed-variant' : 'text-on-surface-variant'
                    }`}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ── Section: Penjadwalan ── */}
        <View className="gap-md">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="calendar-today" size={20} color="#0F5238" />
            <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">
              Penjadwalan
            </Text>
          </View>

          {/* Tanggal Vaksinasi */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Tanggal Vaksinasi</Text>
            <Pressable
              onPress={() => setShowDatepicker(true)}
              className="h-12 flex-row items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4"
            >
              <MaterialCommunityIcons name="calendar-today" size={18} color="#707973" />
              <Text className="ml-3 text-body-md text-on-surface">{formatDisplayDate(vaccinationDate)}</Text>
            </Pressable>
            {showDatepicker && (
              <DateTimePicker
                value={vaccinationDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Jadwal Booster */}
          <View className="rounded-xl border border-brand-light bg-brand-surface p-md">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons name="calendar-refresh" size={18} color="#0F5238" />
                <Text className="text-label-md font-bold text-primary">Jadwal Booster Berikutnya</Text>
              </View>
              <View className="rounded-full bg-primary-container px-2.5 py-0.5">
                <Text className="text-caption font-bold text-on-primary-container">+{BOOSTER_INTERVAL_DAYS} Hari</Text>
              </View>
            </View>
            <View className="h-12 items-center justify-center rounded-xl border border-brand-light bg-white/60 px-4">
              <Text className="text-body-md text-on-surface">{formatDisplayDate(boosterDate)}</Text>
            </View>
            <View className="mt-2 flex-row items-center gap-1 px-1">
              <MaterialCommunityIcons name="information-outline" size={14} color="#707973" />
              <Text className="flex-1 text-caption italic text-tertiary/70">
                Otomatis dihitung {BOOSTER_INTERVAL_DAYS} hari setelah vaksinasi.
              </Text>
            </View>
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

      {/* ── Fixed Bottom Buttons ── */}
      <View className="border-t border-outline-variant/30 bg-surface-container-lowest px-gutter py-md gap-3">
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
          <Text className="text-headline-md font-bold text-on-primary">
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Rekam Vaksinasi'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          className="h-12 items-center justify-center rounded-xl active:bg-surface-container"
        >
          <Text className="text-label-md font-medium text-on-surface-variant">Batalkan</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

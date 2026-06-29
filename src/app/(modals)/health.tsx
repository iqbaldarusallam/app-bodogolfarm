// ─────────────────────────────────────────────────────────
// Form Catat Pemeriksaan Kesehatan — sesuai stitch design
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, TextInput, View, Text, Switch, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { createHealthRecord } from '@/services/health';
import { useDiseases } from '@/hooks/useDiseaseCatalog';
import { useProtocolsByDisease } from '@/hooks/useTreatmentProtocol';
import type { CreateHealthRecordInput, DiseaseCategory } from '@/types/health';
import type { DiseaseCatalogItem } from '@/services/diseaseCatalog';

// ── Constants ──

const SYMPTOM_OPTIONS = ['Diare', 'Lemas', 'Batuk', 'Kembung', 'Luka', 'Pincang'];

const DISEASE_CATEGORIES: { key: DiseaseCategory; label: string }[] = [
  { key: 'infectious', label: 'Infeksi (Bakteri/Virus)' },
  { key: 'metabolic', label: 'Gangguan Metabolik' },
  { key: 'parasitic', label: 'Parasit' },
  { key: 'nutritional', label: 'Gangguan Nutrisi' },
  { key: 'injury', label: 'Cedera Fisik / Luka' },
  { key: 'reproductive', label: 'Gangguan Reproduksi' },
  { key: 'other', label: 'Lainnya' },
];

// ── Helpers ──

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ── Main Screen ──

export default function HealthFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { livestockId, earTag = '', animalName = '' } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    animalName: string;
  }>();

  // ── Form state ──
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Vital signs
  const [temp, setTemp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respRate, setRespRate] = useState('');
  const [rumenMotility, setRumenMotility] = useState<'normal' | 'reduced' | 'absent' | ''>('');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [examinationFindings, setExaminationFindings] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diseaseCategory, setDiseaseCategory] = useState<DiseaseCategory | ''>('');
  const [actionTaken, setActionTaken] = useState('');
  const [referralNeeded, setReferralNeeded] = useState(false);
  const [isInfectious, setIsInfectious] = useState(false);

  // Disease catalog
  const { data: diseases = [] } = useDiseases();
  const [selectedDisease, setSelectedDisease] = useState<DiseaseCatalogItem | null>(null);
  const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
  const [diseaseSearch, setDiseaseSearch] = useState('');

  // Treatment protocol for selected disease
  const { data: protocols = [] } = useProtocolsByDisease(selectedDisease?._id ?? null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSymptom = useCallback((s: string) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }, []);

  const onDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  }, []);

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!chiefComplaint.trim()) newErrors.complaint = 'Keluhan utama wajib diisi';
    if (symptoms.length === 0) newErrors.symptoms = 'Pilih minimal 1 gejala';
    if (!diseaseCategory) newErrors.category = 'Kategori penyakit wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [chiefComplaint, symptoms, diseaseCategory]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createHealthRecord,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
      queryClient.invalidateQueries({ queryKey: ['livestock'] });

      if (isInfectious) {
        // Navigate to quarantine form with the new health record ID
        router.replace({
          pathname: '/(modals)/quarantine',
          params: {
            livestockId: livestockId!,
            earTag,
            animalName,
            currentStatus: 'sick',
            healthRecordId: data._id,
          },
        });
      } else {
        router.back();
      }
    },
    onError: () => {
      setErrors({ submit: 'Gagal menyimpan data. Coba lagi.' });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: CreateHealthRecordInput = {
      livestock_id: livestockId!,
      record_date: toISODate(date),
      chief_complaint: chiefComplaint.trim(),
      symptoms,
      disease_category: diseaseCategory as DiseaseCategory,
      is_infectious: isInfectious,
      referral_needed: referralNeeded,
      ...(temp ? { body_temp_celsius: parseFloat(temp) } : {}),
      ...(heartRate ? { heart_rate_bpm: parseFloat(heartRate) } : {}),
      ...(respRate ? { respiratory_rate: parseFloat(respRate) } : {}),
      ...(rumenMotility ? { rumen_motility: rumenMotility } : {}),
      ...(diagnosis.trim() ? { diagnosis: diagnosis.trim() } : {}),
      ...(examinationFindings.trim() ? { examination_findings: examinationFindings.trim() } : {}),
      ...(actionTaken.trim() ? { action_taken: actionTaken.trim() } : {}),
    };

    mutation.mutate(input);
  }, [
    validate, livestockId, date, chiefComplaint, symptoms,
    diseaseCategory, isInfectious, referralNeeded, temp, heartRate,
    respRate, rumenMotility, diagnosis, examinationFindings,
    actionTaken, mutation,
  ]);

  const displayDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* ── Top AppBar ── */}
      <View className="flex-row items-center bg-surface px-gutter py-sm shadow-sm">
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
        </Pressable>
        <Text className="flex-1 text-center pr-12 font-headline text-headline-md font-semibold text-on-surface">
          Catat Pemeriksaan
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Context Card ── */}
        <View className="mb-6 flex-row items-center gap-3 rounded-xl border-l-4 border-primary bg-surface p-md shadow-sm">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-container">
            <MaterialCommunityIcons name="paw" size={24} color="#0F5238" />
          </View>
          <View>
            <Text className="font-mono text-id-monospace text-on-surface-variant">#{earTag}</Text>
            <Text className="font-headline text-headline-sm font-semibold text-on-surface">{animalName}</Text>
          </View>
        </View>

        <View className="gap-xl">
          {/* ── Tanggal Pemeriksaan ── */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Tanggal Pemeriksaan</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="h-12 items-start justify-center rounded-lg border border-outline-variant bg-surface px-md shadow-sm"
            >
              <Text className="text-body-md text-on-surface">{displayDate}</Text>
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

          {/* ── Tanda Vital (2x2 Grid) ── */}
          <View className="gap-sm">
            <View className="flex-row items-center justify-between">
              <Text className="font-headline text-headline-sm font-semibold text-on-surface">Tanda Vital</Text>
              <Text className="text-caption text-on-surface-variant">Opsional</Text>
            </View>
            <View className="flex-row flex-wrap gap-sm">
              {/* Suhu Tubuh */}
              <View className="w-[48%] rounded-lg border border-outline-variant bg-surface p-3">
                <View className="flex-row items-center gap-1 mb-1">
                  <MaterialCommunityIcons name="thermometer" size={16} color="#F4A261" />
                  <Text className="text-caption text-on-surface-variant">Suhu Tubuh</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <TextInput
                    value={temp}
                    onChangeText={setTemp}
                    keyboardType="decimal-pad"
                    placeholder="--"
                    placeholderTextColor="#BFC9C1"
                    className="flex-1 bg-transparent p-0 text-headline-md font-semibold text-on-surface"
                  />
                  <Text className="text-body-md text-on-surface-variant">°C</Text>
                </View>
                <Text className="mt-1 text-[10px] text-outline">Normal: 38.0 - 39.5</Text>
              </View>

              {/* Detak Jantung */}
              <View className="w-[48%] rounded-lg border border-outline-variant bg-surface p-3">
                <View className="flex-row items-center gap-1 mb-1">
                  <MaterialCommunityIcons name="heart" size={16} color="#E63946" />
                  <Text className="text-caption text-on-surface-variant">Detak Jantung</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <TextInput
                    value={heartRate}
                    onChangeText={setHeartRate}
                    keyboardType="number-pad"
                    placeholder="--"
                    placeholderTextColor="#BFC9C1"
                    className="flex-1 bg-transparent p-0 text-headline-md font-semibold text-on-surface"
                  />
                  <Text className="text-body-md text-on-surface-variant">bpm</Text>
                </View>
                <Text className="mt-1 text-[10px] text-outline">Normal: 40 - 80</Text>
              </View>

              {/* Nafas */}
              <View className="w-[48%] rounded-lg border border-outline-variant bg-surface p-3">
                <View className="flex-row items-center gap-1 mb-1">
                  <MaterialCommunityIcons name="weather-windy" size={16} color="#0F5238" />
                  <Text className="text-caption text-on-surface-variant">Nafas</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <TextInput
                    value={respRate}
                    onChangeText={setRespRate}
                    keyboardType="number-pad"
                    placeholder="--"
                    placeholderTextColor="#BFC9C1"
                    className="flex-1 bg-transparent p-0 text-headline-md font-semibold text-on-surface"
                  />
                  <Text className="text-body-md text-on-surface-variant">/mnt</Text>
                </View>
                <Text className="mt-1 text-[10px] text-outline">Normal: 10 - 30</Text>
              </View>

              {/* Motilitas Rumen */}
              <View className="w-[48%] rounded-lg border border-outline-variant bg-surface p-3">
                <View className="flex-row items-center gap-1 mb-1">
                  <MaterialCommunityIcons name="waves" size={16} color="#2E4E3D" />
                  <Text className="text-caption text-on-surface-variant">Motilitas Rumen</Text>
                </View>
                <View className="flex-row gap-1 mt-1">
                  {(['normal', 'reduced', 'absent'] as const).map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setRumenMotility(rumenMotility === opt ? '' : opt)}
                      className={`flex-1 items-center rounded-lg border py-1.5 ${
                        rumenMotility === opt
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      <Text className={`text-[10px] font-medium ${
                        rumenMotility === opt ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {opt === 'normal' ? 'Normal' : opt === 'reduced' ? 'Turun' : 'Tidak Ada'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ── Keluhan Utama ── */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Keluhan Utama</Text>
            <TextInput
              value={chiefComplaint}
              onChangeText={setChiefComplaint}
              multiline
              numberOfLines={3}
              placeholder="Deskripsikan kondisi umum..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-lg border border-outline-variant bg-surface p-md text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
            {errors.complaint && <Text className="text-caption text-error">{errors.complaint}</Text>}
          </View>

          {/* ── Gejala (Chips) ── */}
          <View className="gap-sm">
            <Text className="font-headline text-headline-sm font-semibold text-on-surface">Gejala</Text>
            <View className="flex-row flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => {
                const active = symptoms.includes(s);
                return (
                  <Pressable
                    key={s}
                    onPress={() => toggleSymptom(s)}
                    className={`rounded-full border px-4 py-2 ${
                      active
                        ? 'border-primary bg-primary-container'
                        : 'border-outline-variant bg-surface'
                    }`}
                  >
                    <Text
                      className={`text-body-md ${
                        active ? 'font-medium text-on-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.symptoms && <Text className="text-caption text-error">{errors.symptoms}</Text>}
          </View>

          {/* ── Diagnosa & Kategori ── */}
          <View className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm gap-md">
            {/* Disease Catalog Picker */}
            <View className="gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Pilih Penyakit (Opsional)</Text>
              <Pressable
                onPress={() => setShowDiseaseDropdown(!showDiseaseDropdown)}
                className="flex-row h-12 items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest px-3"
              >
                <Text className={`flex-1 text-body-md ${selectedDisease ? 'text-on-surface' : 'text-outline'}`}>
                  {selectedDisease ? `${selectedDisease.code} — ${selectedDisease.name}` : 'Pilih dari katalog...'}
                </Text>
                <MaterialCommunityIcons
                  name={showDiseaseDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#707973"
                />
              </Pressable>

              {showDiseaseDropdown && (
                <View className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-md">
                  {/* Search */}
                  <View className="flex-row items-center gap-2 border-b border-outline-variant px-3 py-2">
                    <MaterialCommunityIcons name="magnify" size={16} color="#707973" />
                    <TextInput
                      value={diseaseSearch}
                      onChangeText={setDiseaseSearch}
                      placeholder="Cari penyakit..."
                      placeholderTextColor="#BFC9C1"
                      className="flex-1 text-body-md text-on-surface"
                    />
                  </View>
                  {/* Disease list */}
                  <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
                    {diseases
                      .filter((d) =>
                        d.name.toLowerCase().includes(diseaseSearch.toLowerCase()) ||
                        d.code.toLowerCase().includes(diseaseSearch.toLowerCase())
                      )
                      .map((disease) => (
                        <Pressable
                          key={disease._id}
                          onPress={() => {
                            setSelectedDisease(disease);
                            setDiagnosis(disease.name);
                            setDiseaseCategory(disease.category as DiseaseCategory);
                            setIsInfectious(disease.is_contagious);
                            setShowDiseaseDropdown(false);
                            setDiseaseSearch('');
                          }}
                          className="flex-row items-center gap-3 border-b border-outline-variant px-3 py-3 last:border-b-0"
                        >
                          <View className="flex-1">
                            <Text className="text-body-md font-medium text-on-surface">{disease.name}</Text>
                            <Text className="text-caption text-on-surface-variant">{disease.code} · {disease.category}</Text>
                          </View>
                          {disease.is_contagious && (
                            <View className="rounded-full bg-status-quarantine/10 px-2 py-0.5">
                              <Text className="text-[10px] font-bold text-status-quarantine">MENULAR</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    {diseases.filter((d) =>
                      d.name.toLowerCase().includes(diseaseSearch.toLowerCase()) ||
                      d.code.toLowerCase().includes(diseaseSearch.toLowerCase())
                    ).length === 0 && (
                      <View className="py-4 items-center">
                        <Text className="text-body-sm text-on-surface-variant">Tidak ada penyakit ditemukan</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Selected disease info */}
              {selectedDisease && (
                <View className="rounded-lg bg-primary/5 p-3">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons name="information" size={16} color="#0F5238" />
                    <Text className="text-caption font-medium text-primary">{selectedDisease.name}</Text>
                  </View>
                  {selectedDisease.common_symptoms.length > 0 && (
                    <Text className="mt-1 text-caption text-on-surface-variant">
                      Gejala: {selectedDisease.common_symptoms.join(', ')}
                    </Text>
                  )}
                  {selectedDisease.quarantine_recommended && (
                    <View className="mt-2 flex-row items-center gap-1">
                      <MaterialCommunityIcons name="shield-alert" size={12} color="#E63946" />
                      <Text className="text-[10px] font-bold text-status-quarantine">REKOMENDASI KARANTINA</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Treatment Protocol Recommendation */}
              {selectedDisease && protocols.length > 0 && (
                <View className="rounded-lg border border-info/30 bg-info-light p-3">
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialCommunityIcons name="clipboard-text-clock" size={16} color="#1565C0" />
                    <Text className="text-caption font-bold text-info">PROTOKOL PENANGANAN</Text>
                  </View>
                  {protocols.map((protocol) => (
                    <View key={protocol._id} className="mb-2 last:mb-0">
                      <Text className="text-body-sm font-semibold text-on-surface">{protocol.protocol_name}</Text>
                      <Text className="text-caption text-on-surface-variant">Severity: {protocol.severity_level}</Text>
                      <Text className="text-caption text-on-surface-variant">Tindakan: {protocol.initial_action}</Text>
                      {protocol.recommended_medicines.length > 0 && (
                        <Text className="text-caption text-on-surface-variant">Obat: {protocol.recommended_medicines.join(', ')}</Text>
                      )}
                      {protocol.quarantine_required && (
                        <View className="mt-1 flex-row items-center gap-1">
                          <MaterialCommunityIcons name="shield-alert" size={10} color="#E63946" />
                          <Text className="text-[10px] font-bold text-status-quarantine">WAJIB KARANTINA</Text>
                        </View>
                      )}
                      {protocol.vet_escalation_criteria && (
                        <Text className="mt-1 text-[10px] text-on-surface-variant">Eskalasi: {protocol.vet_escalation_criteria}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Diagnosa (manual) */}
            <View className="gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Diagnosa (Manual)</Text>
              <View className="relative">
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="#707973"
                  className="absolute left-3 top-3"
                />
                <TextInput
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Cari penyakit..."
                  placeholderTextColor="#BFC9C1"
                  className="h-12 rounded-lg border border-outline-variant bg-surface pl-10 pr-md text-body-md text-on-surface focus:border-primary"
                />
              </View>
            </View>

            {/* Kategori Penyakit */}
            <View className="gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Kategori Penyakit</Text>
              <View className="gap-1">
                {DISEASE_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.key}
                    onPress={() => setDiseaseCategory(cat.key)}
                    className={`flex-row items-center rounded-lg border px-4 py-3 ${
                      diseaseCategory === cat.key
                        ? 'border-primary bg-primary/10'
                        : 'border-outline-variant bg-surface'
                    }`}
                  >
                    <View
                      className={`mr-3 h-4 w-4 items-center justify-center rounded-full border-2 ${
                        diseaseCategory === cat.key
                          ? 'border-primary bg-primary'
                          : 'border-outline-variant'
                      }`}
                    >
                      {diseaseCategory === cat.key && (
                        <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      className={`text-body-md ${
                        diseaseCategory === cat.key
                          ? 'font-medium text-primary'
                          : 'text-on-surface'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.category && <Text className="text-caption text-error">{errors.category}</Text>}
            </View>

            {/* Temuan Pemeriksaan */}
            <View className="gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Temuan Pemeriksaan</Text>
              <TextInput
                value={examinationFindings}
                onChangeText={setExaminationFindings}
                multiline
                numberOfLines={2}
                placeholder="Deskripsikan hasil pemeriksaan fisik..."
                placeholderTextColor="#BFC9C1"
                className="min-h-[60px] rounded-lg border border-outline-variant bg-surface p-md text-body-md text-on-surface focus:border-primary"
                textAlignVertical="top"
              />
            </View>

            {/* Tindakan yang Dilakukan */}
            <View className="gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Tindakan yang Dilakukan</Text>
              <TextInput
                value={actionTaken}
                onChangeText={setActionTaken}
                multiline
                numberOfLines={2}
                placeholder="Tindakan medis atau penanganan..."
                placeholderTextColor="#BFC9C1"
                className="min-h-[60px] rounded-lg border border-outline-variant bg-surface p-md text-body-md text-on-surface focus:border-primary"
                textAlignVertical="top"
              />
            </View>

            {/* Perlu Dirujuk? */}
            <View className="flex-row items-center justify-between rounded-lg border border-outline-variant bg-surface p-3">
              <View className="flex-1">
                <Text className="text-label-md font-medium text-on-surface">Perlu Dirujuk ke Drh?</Text>
                <Text className="text-caption text-on-surface-variant">Rujukan ke dokter hewan</Text>
              </View>
              <Switch
                value={referralNeeded}
                onValueChange={setReferralNeeded}
                trackColor={{ false: '#BFC9C1', true: '#0F5238' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Penyakit Menular Toggle */}
            <View className="flex-row items-center justify-between rounded-lg border-l-4 border-status-quarantine bg-error-container/30 p-3">
              <View className="flex-1">
                <View className="flex-row items-center gap-1">
                  <MaterialCommunityIcons name="alert" size={16} color="#E63946" />
                  <Text className="text-label-md font-medium text-on-surface">Penyakit Menular?</Text>
                </View>
                <Text className="text-caption text-on-surface-variant">Tandai untuk karantina otomatis</Text>
              </View>
              <Switch
                value={isInfectious}
                onValueChange={setIsInfectious}
                trackColor={{ false: '#BFC9C1', true: '#E63946' }}
                thumbColor="#FFFFFF"
              />
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

      {/* ── Fixed Bottom Button ── */}
      <View className="border-t border-outline-variant/30 bg-surface-container-lowest px-gutter py-md">
        <Pressable
          onPress={onSubmit}
          disabled={mutation.isPending}
          className={`h-12 flex-row items-center justify-center gap-2 rounded-xl shadow-lg active:scale-[0.98] ${
            mutation.isPending ? 'bg-primary/60' : 'bg-primary'
          }`}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
          )}
          <Text className="text-headline-sm font-bold text-on-primary">
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Data Pemeriksaan'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

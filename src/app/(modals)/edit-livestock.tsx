// ─────────────────────────────────────────────────────────
// Form Edit Ternak — reuse add screen structure with pre-filled data
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { updateLivestock } from '@/services/livestock';
import { PhotoPicker } from '@/components/ui/PhotoPicker';

// ── Constants ──

const SPECIES_OPTIONS = [
  { key: 'kambing', label: 'Kambing', icon: 'paw' },
  { key: 'domba', label: 'Domba', icon: 'sheep' },
  { key: 'sapi', label: 'Sapi', icon: 'cow' },
  { key: 'kerbau', label: 'Kerbau', icon: 'cow' },
];

const BREED_OPTIONS: Record<string, string[]> = {
  kambing: ['PE', 'Kacang', 'Boer', 'Etawa', 'Saanen'],
  domba: ['Garut', 'Ekor Gemuk', 'Merino', 'Texel'],
  sapi: ['Limousin', 'Friesian Holstein', 'Ongole', 'Bali', 'Simmental'],
  kerbau: ['Murrah', 'Sumba Ongol', 'Aceh'],
};

const SEX_OPTIONS = [
  { key: 'male', label: 'Jantan', icon: 'gender-male' },
  { key: 'female', label: 'Betina', icon: 'gender-female' },
];

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

export default function EditLivestockScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Pre-fill from route params
  const params = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    name: string;
    species: string;
    breed: string;
    sex: string;
    birthDate: string;
    origin: string;
    penId: string;
    nationalId: string;
    rfidTag: string;
    notes: string;
    photoUrl: string;
  }>();

  const [earTag, setEarTag] = useState(params.earTag ?? '');
  const [name, setName] = useState(params.name ?? '');
  const [species, setSpecies] = useState(params.species ?? '');
  const [breed, setBreed] = useState(params.breed ?? '');
  const [sex, setSex] = useState(params.sex ?? '');
  const [birthDate, setBirthDate] = useState(
    params.birthDate ? new Date(params.birthDate) : new Date(),
  );
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const origin = params.origin ?? '';
  const [nationalId, setNationalId] = useState(params.nationalId ?? '');
  const [rfidTag, setRfidTag] = useState(params.rfidTag ?? '');
  const [notes, setNotes] = useState(params.notes ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(params.photoUrl || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onBirthDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowBirthPicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  }, []);

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!earTag.trim()) newErrors.earTag = 'Ear tag wajib diisi';
    if (!species) newErrors.species = 'Spesies wajib dipilih';
    if (!breed) newErrors.breed = 'Ras wajib dipilih';
    if (!sex) newErrors.sex = 'Jenis kelamin wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [earTag, species, breed, sex]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      updateLivestock(params.livestockId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      router.back();
    },
    onError: () => {
      setErrors({ submit: 'Gagal menyimpan perubahan. Coba lagi.' });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: Record<string, unknown> = {
      ear_tag: earTag.trim(),
      species,
      breed,
      sex,
      birth_date: toISODate(birthDate),
      origin,
    };

    if (name.trim()) input.name = name.trim();
    else input.name = null;
    if (nationalId.trim()) input.national_id = nationalId.trim();
    if (rfidTag.trim()) input.rfid_tag = rfidTag.trim();
    // current_pen_id tidak diupdate langsung — gunakan Transfer Kandang
    if (notes.trim()) input.notes = notes.trim();
    // foto: kirim url baru, atau null untuk menghapus (jika sebelumnya ada)
    if (photoUrl) input.photo_url = photoUrl;
    else if (params.photoUrl) input.photo_url = null;

    mutation.mutate(input);
  }, [validate, earTag, name, species, breed, sex, birthDate, origin, nationalId, rfidTag, notes, photoUrl, params.photoUrl, mutation]);

  const breeds = BREED_OPTIONS[species] || [];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* ── Header ── */}
      <View className="flex-row items-center bg-surface px-gutter py-sm shadow-sm">
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
        </Pressable>
        <Text className="flex-1 pr-12 text-center font-headline text-headline-md font-semibold text-on-surface">
          Edit Data Ternak
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-xl">
          {/* ── Foto Ternak ── */}
          <View className="items-center">
            <PhotoPicker value={photoUrl} onChange={setPhotoUrl} />
          </View>

          {/* ── Identitas Ternak ── */}
          <View className="gap-md">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="tag" size={20} color="#0F5238" />
              <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">Identitas Ternak</Text>
            </View>

            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Ear Tag <Text className="text-danger">*</Text></Text>
              <TextInput
                value={earTag}
                onChangeText={setEarTag}
                placeholder="Contoh: A-012"
                placeholderTextColor="#BFC9C1"
                autoCapitalize="characters"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-mono text-body-md text-on-surface"
              />
              {errors.earTag && <Text className="text-caption text-danger">{errors.earTag}</Text>}
            </View>

            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Nama Panggilan</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Opsional"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface"
              />
            </View>

            <View className="flex-row gap-md">
              <View className="flex-1 gap-1.5">
                <Text className="text-label-md font-medium text-on-surface-variant">National ID</Text>
                <TextInput
                  value={nationalId}
                  onChangeText={setNationalId}
                  placeholder="Opsional"
                  placeholderTextColor="#BFC9C1"
                  className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-mono text-body-md text-on-surface"
                />
              </View>
              <View className="flex-1 gap-1.5">
                <Text className="text-label-md font-medium text-on-surface-variant">RFID Tag</Text>
                <TextInput
                  value={rfidTag}
                  onChangeText={setRfidTag}
                  placeholder="Opsional"
                  placeholderTextColor="#BFC9C1"
                  className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-mono text-body-md text-on-surface"
                />
              </View>
            </View>
          </View>

          {/* ── Spesies & Ras ── */}
          <View className="gap-md">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="paw" size={20} color="#0F5238" />
              <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">Spesies & Ras</Text>
            </View>

            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Spesies <Text className="text-danger">*</Text></Text>
              <View className="flex-row gap-2">
                {SPECIES_OPTIONS.map((s) => (
                  <Pressable
                    key={s.key}
                    onPress={() => { setSpecies(s.key); setBreed(''); }}
                    className={`flex-1 items-center gap-1 rounded-xl border-2 py-3 ${
                      species === s.key ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface'
                    }`}
                  >
                    <MaterialCommunityIcons name={s.icon as any} size={20} color={species === s.key ? '#0F5238' : '#707973'} />
                    <Text className={`text-label-md font-medium ${species === s.key ? 'text-primary' : 'text-on-surface-variant'}`}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
              {errors.species && <Text className="text-caption text-danger">{errors.species}</Text>}
            </View>

            {species ? (
              <View className="gap-1.5">
                <Text className="text-label-md font-medium text-on-surface-variant">Ras / Galur <Text className="text-danger">*</Text></Text>
                <View className="flex-row flex-wrap gap-2">
                  {breeds.map((b) => (
                    <Pressable
                      key={b}
                      onPress={() => setBreed(b)}
                      className={`rounded-full border px-4 py-2 ${
                        breed === b ? 'border-primary bg-primary-container' : 'border-outline-variant bg-surface'
                      }`}
                    >
                      <Text className={`text-label-md font-medium ${breed === b ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>{b}</Text>
                    </Pressable>
                  ))}
                </View>
                {errors.breed && <Text className="text-caption text-danger">{errors.breed}</Text>}
              </View>
            ) : null}

            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Jenis Kelamin <Text className="text-danger">*</Text></Text>
              <View className="flex-row gap-3">
                {SEX_OPTIONS.map((s) => (
                  <Pressable
                    key={s.key}
                    onPress={() => setSex(s.key)}
                    className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border-2 py-3 ${
                      sex === s.key ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface'
                    }`}
                  >
                    <MaterialCommunityIcons name={s.icon as any} size={20} color={sex === s.key ? '#0F5238' : '#707973'} />
                    <Text className={`text-label-md font-medium ${sex === s.key ? 'text-primary' : 'text-on-surface-variant'}`}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
              {errors.sex && <Text className="text-caption text-danger">{errors.sex}</Text>}
            </View>
          </View>

          {/* ── Tanggal Lahir ── */}
          <View className="gap-md">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="calendar" size={20} color="#0F5238" />
              <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">Tanggal Lahir</Text>
            </View>

            <View className="gap-1.5">
              <Pressable
                onPress={() => setShowBirthPicker(true)}
                className="h-12 flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest px-4"
              >
                <Text className="text-body-md text-on-surface">{formatDisplayDate(birthDate)}</Text>
                <MaterialCommunityIcons name="calendar" size={18} color="#707973" />
              </Pressable>
              {showBirthPicker && (
                <DateTimePicker value={birthDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={new Date()} onChange={onBirthDateChange} />
              )}
            </View>
          </View>

          {/* ── Catatan ── */}
          <View className="gap-1.5">
            <Text className="text-label-md font-medium text-on-surface-variant">Catatan</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Catatan tambahan..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-lg border border-outline-variant bg-surface p-md text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
          </View>

          {/* ── Error ── */}
          {errors.submit && (
            <View className="rounded-xl border border-danger/30 bg-danger-light p-md">
              <Text className="text-body-md text-danger">{errors.submit}</Text>
            </View>
          )}

          {/* ── Submit ── */}
          <Pressable
            onPress={onSubmit}
            disabled={mutation.isPending}
            className="h-14 items-center justify-center rounded-xl bg-primary shadow-md active:scale-[0.98]"
          >
            {mutation.isPending ? (
              <MaterialCommunityIcons name="loading" size={24} color="#FFFFFF" />
            ) : (
              <Text className="font-headline text-headline-sm font-bold text-on-primary">Simpan Perubahan</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

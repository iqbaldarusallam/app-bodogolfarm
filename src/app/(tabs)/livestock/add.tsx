// ─────────────────────────────────────────────────────────
// Form Tambah Ternak Baru — PRD Screen "Pendaftaran Ternak"
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { createLivestock } from '@/services/livestock';
import { usePens } from '@/hooks/useLivestock';

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

const ORIGIN_OPTIONS = [
  { key: 'own_birth', label: 'Lahir di Farm' },
  { key: 'purchase', label: 'Beli' },
  { key: 'donation', label: 'Donasi' },
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

export default function AddLivestockScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: pens = [] } = usePens();

  const availablePens = pens.filter((p) => p.is_active && p.current_count < p.capacity);

  // ── Form state ──
  const [earTag, setEarTag] = useState('');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [origin, setOrigin] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [selectedPenId, setSelectedPenId] = useState('');
  const [showPenDropdown, setShowPenDropdown] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [rfidTag, setRfidTag] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onBirthDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowBirthPicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  }, []);

  const onPurchaseDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPurchasePicker(Platform.OS === 'ios');
    if (selectedDate) setPurchaseDate(selectedDate);
  }, []);

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!earTag.trim()) newErrors.earTag = 'Ear tag wajib diisi';
    if (!species) newErrors.species = 'Spesies wajib dipilih';
    if (!breed) newErrors.breed = 'Ras wajib dipilih';
    if (!sex) newErrors.sex = 'Jenis kelamin wajib dipilih';
    if (!origin) newErrors.origin = 'Asal ternak wajib dipilih';
    if (!selectedPenId) newErrors.pen = 'Kandang wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [earTag, species, breed, sex, origin, selectedPenId]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createLivestock,
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

    const input: Record<string, unknown> = {
      ear_tag: earTag.trim(),
      species,
      breed,
      sex,
      birth_date: toISODate(birthDate),
      origin,
      current_pen_id: selectedPenId,
    };

    if (name.trim()) input.name = name.trim();
    if (nationalId.trim()) input.national_id = nationalId.trim();
    if (rfidTag.trim()) input.rfid_tag = rfidTag.trim();
    if (origin === 'purchase') {
      input.purchase_date = toISODate(purchaseDate);
      if (purchasePrice) input.purchase_price = parseFloat(purchasePrice);
    }
    if (notes.trim()) input.notes = notes.trim();

    mutation.mutate(input);
  }, [validate, earTag, name, species, breed, sex, birthDate, origin, selectedPenId, nationalId, rfidTag, purchaseDate, purchasePrice, notes, mutation]);

  const selectedPen = pens.find((p) => p._id === selectedPenId);
  const breeds = BREED_OPTIONS[species] || [];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* ── Header ── */}
      <View className="flex-row items-center bg-surface px-gutter py-sm shadow-sm">
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
        </Pressable>
        <Text className="flex-1 pr-12 text-center font-headline text-headline-md font-semibold text-on-surface">
          Tambah Ternak Baru
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-xl">
          {/* ── Identitas Ternak ── */}
          <View className="gap-md">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="tag" size={20} color="#2D6A4F" />
              <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">Identitas Ternak</Text>
            </View>

            {/* Ear Tag */}
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

            {/* Nama */}
            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Nama Panggilan</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Opsional, contoh: Jago"
                placeholderTextColor="#BFC9C1"
                className="h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface"
              />
            </View>

            {/* National ID / RFID */}
            <View className="flex-row gap-md">
              <View className="flex-1 gap-1.5">
                <Text className="text-label-md font-medium text-on-surface-variant">National ID (SINKNAS)</Text>
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
              <MaterialCommunityIcons name="paw" size={20} color="#2D6A4F" />
              <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">Spesies & Ras</Text>
            </View>

            {/* Species */}
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
                    <MaterialCommunityIcons name={s.icon as any} size={20} color={species === s.key ? '#2D6A4F' : '#707973'} />
                    <Text className={`text-label-md font-medium ${species === s.key ? 'text-primary' : 'text-on-surface-variant'}`}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
              {errors.species && <Text className="text-caption text-danger">{errors.species}</Text>}
            </View>

            {/* Breed */}
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

            {/* Sex */}
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
                    <MaterialCommunityIcons name={s.icon as any} size={20} color={sex === s.key ? '#2D6A4F' : '#707973'} />
                    <Text className={`text-label-md font-medium ${sex === s.key ? 'text-primary' : 'text-on-surface-variant'}`}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
              {errors.sex && <Text className="text-caption text-danger">{errors.sex}</Text>}
            </View>
          </View>

          {/* ── Asal & Tanggal ── */}
          <View className="gap-md">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="calendar" size={20} color="#2D6A4F" />
              <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">Asal & Tanggal</Text>
            </View>

            {/* Origin */}
            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Asal Ternak <Text className="text-danger">*</Text></Text>
              <View className="flex-row gap-2">
                {ORIGIN_OPTIONS.map((o) => (
                  <Pressable
                    key={o.key}
                    onPress={() => setOrigin(o.key)}
                    className={`flex-1 items-center rounded-xl border py-3 ${
                      origin === o.key ? 'border-primary bg-primary-container' : 'border-outline-variant bg-surface'
                    }`}
                  >
                    <Text className={`text-label-md font-medium ${origin === o.key ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>{o.label}</Text>
                  </Pressable>
                ))}
              </View>
              {errors.origin && <Text className="text-caption text-danger">{errors.origin}</Text>}
            </View>

            {/* Birth Date */}
            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Tanggal Lahir</Text>
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

            {/* Purchase fields */}
            {origin === 'purchase' && (
              <View className="gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md">
                <View className="flex-row gap-md">
                  <View className="flex-1 gap-1.5">
                    <Text className="text-label-md font-medium text-on-surface-variant">Tanggal Beli</Text>
                    <Pressable
                      onPress={() => setShowPurchasePicker(true)}
                      className="h-12 flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface px-4"
                    >
                      <Text className="text-body-md text-on-surface">{formatDisplayDate(purchaseDate)}</Text>
                      <MaterialCommunityIcons name="calendar" size={18} color="#707973" />
                    </Pressable>
                    {showPurchasePicker && (
                      <DateTimePicker value={purchaseDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={new Date()} onChange={onPurchaseDateChange} />
                    )}
                  </View>
                  <View className="flex-1 gap-1.5">
                    <Text className="text-label-md font-medium text-on-surface-variant">Harga Beli (Rp)</Text>
                    <TextInput
                      value={purchasePrice}
                      onChangeText={setPurchasePrice}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#BFC9C1"
                      className="h-12 rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── Kandang ── */}
          <View className="gap-md">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="home" size={20} color="#2D6A4F" />
              <Text className="font-headline text-headline-sm font-bold uppercase tracking-wider text-primary">Kandang</Text>
            </View>

            <View className="gap-1.5">
              <Text className="text-label-md font-medium text-on-surface-variant">Pilih Kandang <Text className="text-danger">*</Text></Text>
              <View className="relative">
                <Pressable
                  onPress={() => setShowPenDropdown((v) => !v)}
                  className="h-12 flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest px-4"
                >
                  <Text className={`text-body-md ${selectedPen ? 'text-on-surface' : 'text-outline-variant'}`}>
                    {selectedPen ? `${selectedPen.pen_code} — ${selectedPen.pen_type}` : 'Pilih kandang'}
                  </Text>
                  <MaterialCommunityIcons name={showPenDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#707973" />
                </Pressable>

                {showPenDropdown && (
                  <View className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 rounded-xl border border-outline-variant bg-white shadow-lg">
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {availablePens.map((pen) => (
                        <Pressable
                          key={pen._id}
                          onPress={() => { setSelectedPenId(pen._id); setShowPenDropdown(false); }}
                          className="border-b border-outline-variant/50 px-4 py-3 active:bg-surface-container-low"
                        >
                          <Text className="text-body-md text-on-surface">{pen.pen_code}</Text>
                          <Text className="text-caption text-on-surface-variant">{pen.pen_type} · {pen.capacity - pen.current_count} tersedia</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              {errors.pen && <Text className="text-caption text-danger">{errors.pen}</Text>}
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
              placeholder="Tambahkan catatan jika diperlukan..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-md text-on-surface"
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

          {/* Submit */}
          <Pressable
            onPress={onSubmit}
            disabled={mutation.isPending}
            className={`h-[52px] flex-row items-center justify-center gap-2 rounded-xl shadow-lg active:scale-[0.98] ${
              mutation.isPending ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
            )}
            <Text className="text-headline-sm font-bold text-on-primary">
              {mutation.isPending ? 'Menyimpan...' : 'Daftarkan Ternak'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// Form Catat Reproduksi — PRD Screen 12 spec
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { createReproductionRecord } from '@/services/reproduction';
import type {
  CreateReproductionInput,
  ReproductionEventType,
  MatingType,
  BirthType,
} from '@/types/reproduction';

// ── Constants ──

const EVENT_TYPES: { key: ReproductionEventType; label: string; icon: string }[] = [
  { key: 'estrus', label: 'Birahi', icon: 'heart-pulse' },
  { key: 'mating', label: 'Kawin', icon: 'account-multiple-check' },
  { key: 'pregnancy_check', label: 'Cek Bunting', icon: 'stethoscope' },
  { key: 'birth', label: 'Kelahiran', icon: 'baby-carriage' },
  { key: 'weaning', label: 'Sapih', icon: 'account-off' },
];

const EASE_SCORES = [
  { score: 1, label: 'Mudah' },
  { score: 2, label: 'Sedang' },
  { score: 3, label: 'Sulit' },
  { score: 4, label: 'Sangat Sulit' },
];

const BIRTH_TYPES: { key: BirthType; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'assisted', label: 'Dibantu' },
  { key: 'caesarean', label: 'Caesar' },
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

export default function ReproductionFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
  }>();

  // ── Form state ──
  const [eventType, setEventType] = useState<string>('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);

  // Estrus
  const [estrusSigns, setEstrusSigns] = useState('');

  // Mating
  const [matingType, setMatingType] = useState<MatingType>('natural');
  const [sireEarTag, setSireEarTag] = useState('');
  const [strawCode, setStrawCode] = useState('');
  const [bullIdStraw, setBullIdStraw] = useState('');

  // Pregnancy
  const [pregnancyStatus, setPregnancyStatus] = useState<'positive' | 'negative' | 'not_checked'>('not_checked');

  // Birth
  const [offspringCount, setOffspringCount] = useState('');
  const [kiddingEaseScore, setKiddingEaseScore] = useState(2);
  const [birthType, setBirthType] = useState<BirthType>('normal');

  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatepicker(Platform.OS === 'ios');
    if (selectedDate) setEventDate(selectedDate);
  }, []);

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!eventType) newErrors.eventType = 'Tipe event wajib dipilih';

    if (eventType === 'mating') {
      if (matingType === 'natural' && !sireEarTag.trim()) {
        newErrors.sire = 'Ear tag pejantan wajib diisi untuk kawin alam';
      }
      if (matingType === 'AI' && !strawCode.trim()) {
        newErrors.straw = 'Kode straw wajib diisi untuk Inseminasi Buatan';
      }
    }

    if (eventType === 'birth') {
      const count = parseInt(offspringCount);
      if (!offspringCount || isNaN(count) || count < 1) {
        newErrors.offspring = 'Jumlah anak wajib diisi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [eventType, matingType, sireEarTag, strawCode, offspringCount]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createReproductionRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproduction'] });
      queryClient.invalidateQueries({ queryKey: ['livestock'] });

      // F3: Post-birth offspring registration prompt
      if (eventType === 'birth') {
        const count = parseInt(offspringCount) || 1;
        Alert.alert(
          'Kelahiran Tercatat',
          `${count} ekor anak telah lahir. Daftarkan anak yang baru lahir?`,
          [
            { text: 'Nanti Saja', style: 'cancel', onPress: () => router.back() },
            {
              text: 'Daftarkan Sekarang',
              onPress: () => {
                router.replace({
                  pathname: '/(tabs)/livestock/add',
                  params: { damId: livestockId },
                });
              },
            },
          ],
        );
      } else {
        router.back();
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal menyimpan data. Coba lagi.';
      setErrors({ submit: msg });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: CreateReproductionInput = {
      livestock_id: livestockId!,
      event_type: eventType as ReproductionEventType,
      event_date: toISODate(eventDate),
      ...(estrusSigns.trim() ? { estrus_signs: estrusSigns.trim().split(',').map((s) => s.trim()) } : {}),
      ...(eventType === 'mating' ? {
        mating_type: matingType,
        ...(matingType === 'natural' ? { sire_id: sireEarTag } : {}),
        ...(matingType === 'AI' ? { straw_code: strawCode, bull_id_straw: bullIdStraw } : {}),
      } : {}),
      ...(eventType === 'pregnancy_check' ? { pregnancy_status: pregnancyStatus } : {}),
      ...(eventType === 'birth' ? {
        offspring_count: parseInt(offspringCount),
        birth_type: birthType,
        kidding_ease_score: kiddingEaseScore,
      } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    mutation.mutate(input);
  }, [
    validate, livestockId, eventType, eventDate, estrusSigns,
    matingType, sireEarTag, strawCode, bullIdStraw,
    pregnancyStatus, offspringCount, birthType, kiddingEaseScore,
    notes, mutation,
  ]);

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
        <Text className="flex-1 pr-12 text-center font-headline text-headline-md font-semibold text-on-surface">
          Catat Reproduksi
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
            <Text className="font-headline text-headline-sm font-semibold text-on-surface">Reproduksi Betina</Text>
          </View>
        </View>

        <View className="gap-xl">
          {/* ── Tipe Event ── */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Tipe Event</Text>
            <View className="gap-2">
              {EVENT_TYPES.map((et) => (
                <Pressable
                  key={et.key}
                  onPress={() => setEventType(et.key)}
                  className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 ${
                    eventType === et.key
                      ? 'border-primary bg-primary/10'
                      : 'border-outline-variant bg-surface'
                  }`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      eventType === et.key ? 'bg-primary' : 'bg-surface-container-high'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={et.icon as any}
                      size={20}
                      color={eventType === et.key ? '#FFFFFF' : '#404943'}
                    />
                  </View>
                  <Text
                    className={`text-body-md ${
                      eventType === et.key ? 'font-semibold text-primary' : 'text-on-surface'
                    }`}
                  >
                    {et.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.eventType && <Text className="text-caption text-error">{errors.eventType}</Text>}
          </View>

          {/* ── Tanggal Event ── */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Tanggal Event</Text>
            <Pressable
              onPress={() => setShowDatepicker(true)}
              className="h-12 items-start justify-center rounded-xl border border-outline-variant bg-surface px-md"
            >
              <Text className="text-body-md text-on-surface">{formatDisplayDate(eventDate)}</Text>
            </Pressable>
            {showDatepicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onDateChange}
              />
            )}
          </View>

          {/* ── Estrus (Birahi) ── */}
          {eventType === 'estrus' && (
            <View className="gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Tanda Birahi</Text>
              <TextInput
                value={estrusSigns}
                onChangeText={setEstrusSigns}
                placeholder="Contoh: bengkak vulva, lendir bening, berdiri saat ditekan"
                placeholderTextColor="#BFC9C1"
                multiline
                numberOfLines={3}
                className="min-h-[80px] rounded-xl border border-outline-variant bg-surface p-md text-body-md text-on-surface"
                textAlignVertical="top"
              />
            </View>
          )}

          {/* ── Mating (Kawin) ── */}
          {eventType === 'mating' && (
            <View className="gap-lg">
              {/* Metode Perkawinan */}
              <View className="gap-sm">
                <Text className="text-label-md font-medium text-on-surface-variant">Metode Perkawinan</Text>
                <View className="flex-row gap-3">
                  {[
                    { key: 'natural' as MatingType, label: 'Kawin Alam', icon: 'cow' },
                    { key: 'AI' as MatingType, label: 'Inseminasi Buatan (IB)', icon: 'syringe' },
                  ].map((m) => (
                    <Pressable
                      key={m.key}
                      onPress={() => setMatingType(m.key)}
                      className={`flex-1 items-center gap-2 rounded-xl border-2 py-3 ${
                        matingType === m.key
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant bg-surface'
                      }`}
                    >
                      <MaterialCommunityIcons
                        name={m.icon as any}
                        size={20}
                        color={matingType === m.key ? '#0F5238' : '#707973'}
                      />
                      <Text
                        className={`text-label-md font-medium ${
                          matingType === m.key ? 'text-primary' : 'text-on-surface-variant'
                        }`}
                      >
                        {m.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Kawin Alam: Pejantan */}
              {matingType === 'natural' && (
                <View className="gap-sm">
                  <Text className="text-label-md font-medium text-on-surface-variant">Ear Tag Pejantan</Text>
                  <TextInput
                    value={sireEarTag}
                    onChangeText={setSireEarTag}
                    placeholder="Masukkan ear tag pejantan..."
                    placeholderTextColor="#BFC9C1"
                    className="h-12 rounded-xl border border-outline-variant bg-surface px-md font-mono text-body-md text-on-surface"
                  />
                  {errors.sire && <Text className="text-caption text-error">{errors.sire}</Text>}
                </View>
              )}

              {/* IB/AI: Straw + Bull ID */}
              {matingType === 'AI' && (
                <View className="gap-md">
                  <View className="gap-sm">
                    <Text className="text-label-md font-medium text-on-surface-variant">Kode Straw</Text>
                    <TextInput
                      value={strawCode}
                      onChangeText={setStrawCode}
                      placeholder="Contoh: STR-2024-A-01"
                      placeholderTextColor="#BFC9C1"
                      className="h-12 rounded-xl border border-outline-variant bg-surface px-md font-mono text-body-md text-on-surface"
                    />
                    {errors.straw && <Text className="text-caption text-error">{errors.straw}</Text>}
                  </View>
                  <View className="gap-sm">
                    <Text className="text-label-md font-medium text-on-surface-variant">ID Pejantan Straw</Text>
                    <TextInput
                      value={bullIdStraw}
                      onChangeText={setBullIdStraw}
                      placeholder="ID pejantan dari straw..."
                      placeholderTextColor="#BFC9C1"
                      className="h-12 rounded-xl border border-outline-variant bg-surface px-md font-mono text-body-md text-on-surface"
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ── Pregnancy Check ── */}
          {eventType === 'pregnancy_check' && (
            <View className="gap-sm">
              <Text className="text-label-md font-medium text-on-surface-variant">Hasil Pemeriksaan</Text>
              <View className="flex-row gap-3">
                {[
                  { key: 'positive' as const, label: 'Bunting', color: '#52B788', icon: 'check-circle' },
                  { key: 'negative' as const, label: 'Tidak Bunting', color: '#E63946', icon: 'close-circle' },
                ].map((p) => (
                  <Pressable
                    key={p.key}
                    onPress={() => setPregnancyStatus(p.key)}
                    className={`flex-1 items-center gap-2 rounded-xl border-2 py-4 ${
                      pregnancyStatus === p.key
                        ? `border-[${p.color}] bg-[${p.color}]/10`
                        : 'border-outline-variant bg-surface'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={p.icon as any}
                      size={28}
                      color={pregnancyStatus === p.key ? p.color : '#707973'}
                    />
                    <Text
                      className={`text-body-md font-semibold ${
                        pregnancyStatus === p.key ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ── Birth (Kelahiran) ── */}
          {eventType === 'birth' && (
            <View className="gap-lg">
              {/* Jumlah Anak */}
              <View className="gap-sm">
                <Text className="text-label-md font-medium text-on-surface-variant">Jumlah Anak</Text>
                <View className="flex-row gap-3">
                  {[1, 2, 3].map((count) => (
                    <Pressable
                      key={count}
                      onPress={() => setOffspringCount(String(count))}
                      className={`h-14 flex-1 items-center justify-center rounded-xl border-2 ${
                        offspringCount === String(count)
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant bg-surface'
                      }`}
                    >
                      <Text
                        className={`text-headline-md font-bold ${
                          offspringCount === String(count) ? 'text-primary' : 'text-on-surface-variant'
                        }`}
                      >
                        {count}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {errors.offspring && <Text className="text-caption text-error">{errors.offspring}</Text>}
              </View>

              {/* Kemudahan Kelahiran */}
              <View className="gap-sm">
                <Text className="text-label-md font-medium text-on-surface-variant">Kemudahan Kelahiran (1–4)</Text>
                <View className="flex-row gap-2">
                  {EASE_SCORES.map((e) => (
                    <Pressable
                      key={e.score}
                      onPress={() => setKiddingEaseScore(e.score)}
                      className={`flex-1 items-center gap-1 rounded-xl border-2 py-3 ${
                        kiddingEaseScore === e.score
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant bg-surface'
                      }`}
                    >
                      <Text
                        className={`text-headline-md font-bold ${
                          kiddingEaseScore === e.score ? 'text-primary' : 'text-on-surface-variant'
                        }`}
                      >
                        {e.score}
                      </Text>
                      <Text
                        className={`text-[10px] font-bold uppercase ${
                          kiddingEaseScore === e.score ? 'text-primary' : 'text-outline'
                        }`}
                      >
                        {e.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Tipe Kelahiran */}
              <View className="gap-sm">
                <Text className="text-label-md font-medium text-on-surface-variant">Tipe Kelahiran</Text>
                <View className="flex-row gap-2">
                  {BIRTH_TYPES.map((bt) => (
                    <Pressable
                      key={bt.key}
                      onPress={() => setBirthType(bt.key)}
                      className={`flex-1 items-center justify-center rounded-xl border py-3 ${
                        birthType === bt.key
                          ? 'border-primary bg-primary-container'
                          : 'border-outline-variant bg-surface'
                      }`}
                    >
                      <Text
                        className={`text-label-md font-medium ${
                          birthType === bt.key ? 'text-on-primary-container' : 'text-on-surface-variant'
                        }`}
                      >
                        {bt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ── Catatan ── */}
          <View className="gap-sm">
            <Text className="text-label-md font-medium text-on-surface-variant">Catatan</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Tambahkan catatan jika diperlukan..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-xl border border-outline-variant bg-surface p-md text-body-md text-on-surface"
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

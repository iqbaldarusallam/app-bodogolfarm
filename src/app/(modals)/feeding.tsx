// ─────────────────────────────────────────────────────────
// Form Catat Pakan — sesuai stitch design
// ─────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

import { createFeedingLog } from '@/services/feeding';
import { useActiveFeedMasters, useFeedingByLivestock } from '@/hooks/useLivestock';
import type { CreateFeedingLogInput, FeedingTime, AppetiteResponse } from '@/types/feeding';

// ── Constants ──

const TIME_OPTIONS: { key: FeedingTime; label: string }[] = [
  { key: 'morning', label: 'Pagi' },
  { key: 'afternoon', label: 'Siang' },
  { key: 'evening', label: 'Sore' },
];

const APPETITE_OPTIONS: {
  key: AppetiteResponse;
  label: string;
  dotColor: string;
  activeBg: string;
}[] = [
  { key: 'normal', label: 'Normal', dotColor: '#52B788', activeBg: 'bg-primary-container' },
  { key: 'reduced', label: 'Berkurang', dotColor: '#F4A261', activeBg: 'bg-status-sick/20' },
  { key: 'refused', label: 'Menolak', dotColor: '#E63946', activeBg: 'bg-status-quarantine/10' },
];

// ── Helpers ──

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toFeedingTimeLabel(time: string): string {
  const map: Record<string, string> = { morning: 'Pagi', afternoon: 'Siang', evening: 'Sore' };
  return map[time] ?? time;
}

// ── Main Screen ──

export default function FeedingFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
    lastWeight = '0',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    lastWeight: string;
  }>();

  const lastWeightNum = parseFloat(lastWeight) || 0;

  // ── Data ──
  const { data: feedMasters = [] } = useActiveFeedMasters();
  const { data: feedingLogs = [] } = useFeedingByLivestock(livestockId ?? '');

  // ── Form state ──
  const [feedingTime, setFeedingTime] = useState<FeedingTime>('morning');
  const [selectedFeedId, setSelectedFeedId] = useState('');
  const [feedSearch, setFeedSearch] = useState('');
  const [showFeedDropdown, setShowFeedDropdown] = useState(false);
  const [amountGiven, setAmountGiven] = useState('');
  const [amountConsumed, setAmountConsumed] = useState('');
  const [appetite, setAppetite] = useState<AppetiteResponse>('normal');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Filtered feed list ──
  const filteredFeeds = useMemo(() => {
    if (!feedSearch) return feedMasters;
    const q = feedSearch.toLowerCase();
    return feedMasters.filter((f) => f.feed_name.toLowerCase().includes(q));
  }, [feedMasters, feedSearch]);

  const selectedFeed = useMemo(
    () => feedMasters.find((f) => f._id === selectedFeedId),
    [feedMasters, selectedFeedId],
  );

  // ── DMI live calculation ──
  const dmiPreview = useMemo(() => {
    const consumed = parseFloat(amountConsumed);
    if (isNaN(consumed) || consumed <= 0 || lastWeightNum <= 0) return null;
    return ((consumed / lastWeightNum) * 100).toFixed(2);
  }, [amountConsumed, lastWeightNum]);

  // ── Previous logs (last 2) ──
  const previousLogs = useMemo(() => feedingLogs.slice(0, 2), [feedingLogs]);

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const given = parseFloat(amountGiven);

    if (!selectedFeedId) newErrors.feed = 'Jenis pakan wajib dipilih';
    if (!amountGiven || isNaN(given) || given <= 0) newErrors.amount = 'Jumlah diberikan wajib diisi';

    if (amountConsumed) {
      const consumed = parseFloat(amountConsumed);
      if (!isNaN(consumed) && consumed > given) {
        newErrors.consumed = 'Estimasi konsumsi tidak boleh melebihi jumlah diberikan';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedFeedId, amountGiven, amountConsumed]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createFeedingLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding'] });
      router.back();
    },
    onError: () => {
      setErrors({ submit: 'Gagal menyimpan data. Coba lagi.' });
    },
  });

  const onSubmit = useCallback(() => {
    if (!validate()) return;

    const input: CreateFeedingLogInput = {
      livestock_id: livestockId!,
      feed_master_id: selectedFeedId,
      feed_date: toISODate(new Date()),
      feeding_time: feedingTime,
      amount_given_kg: parseFloat(amountGiven),
      ...(amountConsumed ? { amount_consumed_kg: parseFloat(amountConsumed) } : {}),
      appetite_response: appetite,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    mutation.mutate(input);
  }, [validate, livestockId, selectedFeedId, feedingTime, amountGiven, amountConsumed, appetite, notes, mutation]);

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* ── Top AppBar ── */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F5238" />
          </Pressable>
          <View>
            <Text className="font-headline text-headline-sm font-semibold text-primary">Catat Pakan</Text>
            <Text className="text-caption text-on-surface-variant">#{earTag} · {today}</Text>
          </View>
        </View>
        <View className="rounded bg-primary-fixed px-2 py-1">
          <Text className="font-mono text-id-monospace text-primary-container">ID: {earTag}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Quick Stats Card ── */}
        <View className="mb-6 flex-row items-center justify-between rounded-xl bg-white/80 p-lg shadow-sm">
          <View className="space-y-1">
            <Text className="text-caption uppercase tracking-wider text-on-surface-variant">Bobot Terakhir</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-headline-lg font-bold text-on-surface">{lastWeightNum.toFixed(1)}</Text>
              <Text className="text-body-md text-on-surface-variant">kg</Text>
            </View>
          </View>
          <View className="h-10 w-px bg-outline-variant" />
          <View className="items-end space-y-1">
            <Text className="text-caption uppercase tracking-wider text-on-surface-variant">Target DMI</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-headline-lg font-bold text-primary">
                {lastWeightNum > 0 ? (lastWeightNum * 0.03).toFixed(1) : '0.0'}
              </Text>
              <Text className="text-body-md text-on-surface-variant">kg</Text>
            </View>
          </View>
        </View>

        {/* ── Form Section ── */}
        <View className="gap-xl rounded-xl bg-surface-container-lowest p-lg shadow-sm">

          {/* Waktu Pemberian */}
          <View className="gap-md">
            <Text className="text-label-md font-medium text-on-surface-variant">Waktu Pemberian</Text>
            <View className="flex-row gap-sm">
              {TIME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setFeedingTime(opt.key)}
                  className={`flex-1 items-center rounded-lg border py-3 ${
                    feedingTime === opt.key
                      ? 'border-primary-container bg-primary-container'
                      : 'border-transparent bg-surface-container'
                  }`}
                >
                  <Text
                    className={`text-label-md font-medium ${
                      feedingTime === opt.key ? 'text-on-primary-container' : 'text-on-surface-variant'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Jenis Pakan */}
          <View className="gap-md">
            <Text className="text-label-md font-medium text-on-surface-variant">Jenis Pakan</Text>
            <View className="relative">
              <Pressable
                onPress={() => setShowFeedDropdown((v) => !v)}
                className="flex-row items-center rounded-xl border border-outline-variant bg-white px-4 py-3.5"
              >
                <MaterialCommunityIcons name="magnify" size={20} color="#707973" />
                <TextInput
                  value={selectedFeed ? selectedFeed.feed_name : feedSearch}
                  onChangeText={(t) => {
                    setFeedSearch(t);
                    setSelectedFeedId('');
                    setShowFeedDropdown(true);
                  }}
                  onFocus={() => setShowFeedDropdown(true)}
                  placeholder="Cari atau pilih pakan..."
                  placeholderTextColor="#BFC9C1"
                  className="ml-2 flex-1 text-body-lg text-on-surface"
                />
                <MaterialCommunityIcons
                  name={showFeedDropdown ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#707973"
                />
              </Pressable>

              {showFeedDropdown && filteredFeeds.length > 0 && (
                <View className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 rounded-xl border border-outline-variant bg-white shadow-lg">
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {filteredFeeds.map((feed) => (
                      <Pressable
                        key={feed._id}
                        onPress={() => {
                          setSelectedFeedId(feed._id);
                          setFeedSearch('');
                          setShowFeedDropdown(false);
                        }}
                        className="border-b border-outline-variant/50 px-4 py-3 active:bg-surface-container-low"
                      >
                        <Text className="text-body-md text-on-surface">{feed.feed_name}</Text>
                        <Text className="text-caption text-on-surface-variant">{feed.feed_type}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            {errors.feed && <Text className="text-caption text-error">{errors.feed}</Text>}
          </View>

          {/* Jumlah + Estimasi — side by side */}
          <View className="flex-row gap-md">
            <View className="flex-1 gap-md">
              <Text className="text-label-md font-medium text-on-surface-variant">Jumlah Diberikan</Text>
              <View className="relative">
                <TextInput
                  value={amountGiven}
                  onChangeText={setAmountGiven}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#BFC9C1"
                  className="h-12 rounded-xl border border-outline-variant bg-white px-4 pr-10 text-headline-md font-semibold text-on-surface focus:border-primary"
                />
                <Text className="absolute right-4 top-1/2 -translate-y-1/2 text-body-md text-outline">kg</Text>
              </View>
              {errors.amount && <Text className="text-caption text-error">{errors.amount}</Text>}
            </View>
            <View className="flex-1 gap-md">
              <Text className="text-label-md font-medium text-on-surface-variant">Estimasi Konsumsi</Text>
              <View className="relative">
                <TextInput
                  value={amountConsumed}
                  onChangeText={setAmountConsumed}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#BFC9C1"
                  className="h-12 rounded-xl border border-outline-variant bg-white px-4 pr-10 text-headline-md font-semibold text-on-surface focus:border-primary"
                />
                <Text className="absolute right-4 top-1/2 -translate-y-1/2 text-body-md text-outline">kg</Text>
              </View>
              {errors.consumed && <Text className="text-caption text-error">{errors.consumed}</Text>}
            </View>
          </View>

          {/* DMI Preview */}
          <View className="flex-row items-center justify-between rounded-xl border border-brand-light bg-brand-surface p-md">
            <View className="flex-row items-center gap-sm">
              <MaterialCommunityIcons name="chart-bar" size={20} color="#2D6A4F" />
              <Text className="text-body-md text-primary-container">DMI Aktual (Estimasi)</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              <Text
                className={`text-headline-md font-bold ${
                  dmiPreview && parseFloat(dmiPreview) < 2.5 ? 'text-status-sick' : 'text-primary'
                }`}
              >
                {dmiPreview ?? '0.00'}
              </Text>
              <Text className="text-caption text-primary-container">% BW</Text>
            </View>
          </View>

          {/* Respons Nafsu Makan */}
          <View className="gap-md">
            <Text className="text-label-md font-medium text-on-surface-variant">Respons Nafsu Makan</Text>
            <View className="flex-row flex-wrap gap-sm">
              {APPETITE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setAppetite(opt.key)}
                  className={`flex-row items-center gap-2 rounded-full border px-5 py-3 ${
                    appetite === opt.key
                      ? `border-transparent ${opt.activeBg}`
                      : 'border-outline-variant bg-surface-container-lowest'
                  }`}
                >
                  <View
                    className={`h-2 w-2 rounded-full ${
                      appetite === opt.key ? 'bg-white' : ''
                    }`}
                    style={appetite !== opt.key ? { backgroundColor: opt.dotColor } : undefined}
                  />
                  <Text
                    className={`text-body-md ${
                      appetite === opt.key ? 'font-medium text-white' : 'text-on-surface'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Catatan */}
          <View className="gap-md">
            <Text className="text-label-md font-medium text-on-surface-variant">Catatan Tambahan</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Contoh: Sisa pakan agak basah, nafsu makan stabil..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-xl border border-outline-variant bg-white p-4 text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ── Previous Logs ── */}
        {previousLogs.length > 0 && (
          <View className="mt-6 flex-row gap-md">
            {previousLogs.map((log) => {
              const feedName = feedMasters.find((f) => f._id === log.feed_master_id)?.feed_name ?? 'Pakan';
              const isFullyConsumed =
                log.amount_consumed_kg != null && log.amount_consumed_kg >= log.amount_given_kg;
              return (
                <View key={log._id} className="flex-1 rounded-xl bg-surface-container p-md">
                  <Text className="text-caption text-on-surface-variant">
                    {formatShortDate(log.feed_date)} {toFeedingTimeLabel(log.feeding_time)}
                  </Text>
                  <Text className="mt-1 text-body-md font-bold text-on-surface">
                    {log.amount_given_kg} kg {feedName}
                  </Text>
                  <View className="mt-1 flex-row items-center gap-1">
                    <MaterialCommunityIcons
                      name={isFullyConsumed ? 'check-circle' : 'information'}
                      size={14}
                      color={isFullyConsumed ? '#52B788' : '#F4A261'}
                    />
                    <Text
                      className="text-caption"
                      style={{ color: isFullyConsumed ? '#52B788' : '#F4A261' }}
                    >
                      {isFullyConsumed
                        ? 'Habis'
                        : `Sisa ${(log.amount_given_kg - (log.amount_consumed_kg ?? 0)).toFixed(1)}kg`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Record'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

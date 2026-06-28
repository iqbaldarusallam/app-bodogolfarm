// ─────────────────────────────────────────────────────────
// Master Data Pakan — Feed Master Management Modal
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/auth';
import { getAllFeedMasters, createFeedMaster } from '@/services/feeding';
import type { CreateFeedMasterInput } from '@/types/feeding';

const FEED_TYPES = [
  { label: 'Hijauan', value: 'hijauan' },
  { label: 'Konsentrat', value: 'konsentrat' },
  { label: 'Silase', value: 'silase' },
  { label: 'Limbah', value: 'limbah' },
  { label: 'Suplemen', value: 'suplemen' },
] as const;

const FEED_SOURCES = [
  { label: 'Lapangan', value: 'lapangan' },
  { label: 'Beli', value: 'beli' },
  { label: 'Fermentasi Sendiri', value: 'fermentasi_sendiri' },
] as const;

const FEED_UNITS = [
  { label: 'kg', value: 'kg' },
  { label: 'Liter', value: 'liter' },
  { label: 'Ikat', value: 'ikat' },
] as const;

const FEED_TYPE_COLORS: Record<string, string> = {
  hijauan: 'bg-status-active',
  konsentrat: 'bg-primary',
  silase: 'bg-tertiary',
  limbah: 'bg-outline',
  suplemen: 'bg-secondary',
};

export default function FeedMasterScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: feeds = [], isLoading } = useQuery({
    queryKey: ['feedMaster'],
    queryFn: getAllFeedMasters,
    staleTime: 5 * 60 * 1000,
  });

  // ── Create form ──
  const [showForm, setShowForm] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedType, setFeedType] = useState('hijauan');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [source, setSource] = useState('beli');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [dryMatterPct, setDryMatterPct] = useState('');
  const [crudeProteinPct, setCrudeProteinPct] = useState('');
  const [metabolizableEnergy, setMetabolizableEnergy] = useState('');
  const [unit, setUnit] = useState('kg');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFeedName('');
    setFeedType('hijauan');
    setSource('beli');
    setDryMatterPct('');
    setCrudeProteinPct('');
    setMetabolizableEnergy('');
    setUnit('kg');
    setPricePerUnit('');
    setErrors({});
  };

  const handleToggleForm = () => {
    if (showForm) resetForm();
    setShowForm((v) => !v);
  };

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createFeedMaster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedMaster'] });
      resetForm();
      setShowForm(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan';
      setErrors({ submit: msg });
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!feedName.trim()) e.feedName = 'Nama pakan wajib diisi';
    if (!dryMatterPct || parseFloat(dryMatterPct) < 0 || parseFloat(dryMatterPct) > 100) {
      e.dryMatterPct = 'BK harus 0-100%';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const input: CreateFeedMasterInput = {
      farm_id: user!.farm_id,
      feed_name: feedName.trim(),
      feed_type: feedType,
      source,
      dry_matter_pct: parseFloat(dryMatterPct),
      ...(crudeProteinPct ? { crude_protein_pct: parseFloat(crudeProteinPct) } : {}),
      ...(metabolizableEnergy ? { metabolizable_energy: parseFloat(metabolizableEnergy) } : {}),
      unit,
      ...(pricePerUnit ? { price_per_unit: parseFloat(pricePerUnit) } : {}),
    };
    mutation.mutate(input);
  };

  // ── Dropdown component helper ──
  function renderDropdown<T extends { label: string; value: string }>(
    items: readonly T[],
    selectedValue: string,
    onSelect: (val: string) => void,
    isOpen: boolean,
    setIsOpen: (v: boolean) => void,
    label: string,
  ) {
    return (
      <View className="relative">
        <Text className="text-label-md font-medium text-on-surface-variant px-1 mb-1">
          {label}
        </Text>
        <Pressable
          onPress={() => setIsOpen(!isOpen)}
          className="h-[48px] flex-row items-center justify-between rounded-xl border border-outline-variant bg-surface px-4"
        >
          <Text className="text-body-md text-on-surface">
            {items.find((i) => i.value === selectedValue)?.label ?? ''}
          </Text>
          <MaterialCommunityIcons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#707973"
          />
        </Pressable>
        {isOpen && (
          <View className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-outline-variant bg-white shadow-lg">
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              {items.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => {
                    onSelect(item.value);
                    setIsOpen(false);
                  }}
                  className={`border-b border-outline-variant/50 px-4 py-3 active:bg-surface-container-low ${
                    selectedValue === item.value ? 'bg-primary-container/30' : ''
                  }`}
                >
                  <Text className="text-body-md text-on-surface">{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F5238" />
          </Pressable>
          <Text className="font-headline text-headline-md font-bold text-primary">
            Master Data Pakan
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary-fixed">
          <MaterialCommunityIcons name="archive-outline" size={20} color="#0F5238" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Add Button */}
        <Pressable
          onPress={handleToggleForm}
          className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-primary-container/30 py-3 active:scale-[0.98]"
        >
          <MaterialCommunityIcons
            name={showForm ? 'close' : 'plus'}
            size={20}
            color="#0F5238"
          />
          <Text className="font-headline text-headline-sm font-semibold text-primary">
            {showForm ? 'Batal' : 'Tambah Pakan'}
          </Text>
        </Pressable>

        {/* Inline Form */}
        {showForm && (
          <View className="mb-6 gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            {/* Feed Name */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Nama Pakan
              </Text>
              <TextInput
                value={feedName}
                onChangeText={setFeedName}
                placeholder="Contoh: Rumput Odot, Tepung Jagung"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
              {errors.feedName && (
                <Text className="text-caption text-error">{errors.feedName}</Text>
              )}
            </View>

            {/* Feed Type */}
            {renderDropdown(FEED_TYPES, feedType, setFeedType, showTypeDropdown, setShowTypeDropdown, 'Jenis Pakan')}

            {/* Source */}
            {renderDropdown(FEED_SOURCES, source, setSource, showSourceDropdown, setShowSourceDropdown, 'Sumber')}

            {/* Dry Matter % */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Bahan Kering (%)
              </Text>
              <TextInput
                value={dryMatterPct}
                onChangeText={setDryMatterPct}
                keyboardType="decimal-pad"
                placeholder="0-100"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
              {errors.dryMatterPct && (
                <Text className="text-caption text-error">{errors.dryMatterPct}</Text>
              )}
            </View>

            {/* Crude Protein % */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Protein Kasar (%)
              </Text>
              <TextInput
                value={crudeProteinPct}
                onChangeText={setCrudeProteinPct}
                keyboardType="decimal-pad"
                placeholder="Opsional"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
            </View>

            {/* Metabolizable Energy */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Energi Metabolizable (kkal/kg)
              </Text>
              <TextInput
                value={metabolizableEnergy}
                onChangeText={setMetabolizableEnergy}
                keyboardType="decimal-pad"
                placeholder="Opsional"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
            </View>

            {/* Unit */}
            {renderDropdown(FEED_UNITS, unit, setUnit, showUnitDropdown, setShowUnitDropdown, 'Satuan')}

            {/* Price Per Unit */}
            <View className="gap-1">
              <Text className="text-label-md font-medium text-on-surface-variant px-1">
                Harga per Satuan (Rp)
              </Text>
              <TextInput
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                keyboardType="number-pad"
                placeholder="Opsional"
                placeholderTextColor="#BFC9C1"
                className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
              />
            </View>

            {/* Submit error */}
            {errors.submit && (
              <View className="flex-row items-center gap-2 rounded-lg border border-error-container bg-error-container/30 p-3">
                <MaterialCommunityIcons name="alert-circle" size={16} color="#BA1A1A" />
                <Text className="flex-1 text-caption text-error">{errors.submit}</Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={onSubmit}
              disabled={mutation.isPending}
              className={`h-12 flex-row items-center justify-center gap-2 rounded-xl shadow-md active:scale-[0.98] ${
                mutation.isPending ? 'bg-primary/60' : 'bg-primary'
              }`}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              )}
              <Text className="font-headline text-headline-sm font-bold text-on-primary">
                {mutation.isPending ? 'Menyimpan...' : 'Simpan Pakan'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Feed List */}
        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#0F5238" />
            <Text className="mt-3 text-body-md text-on-surface-variant">Memuat data pakan...</Text>
          </View>
        ) : feeds.length === 0 ? (
          <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-10">
            <MaterialCommunityIcons name="archive-outline" size={48} color="#BFC9C1" />
            <Text className="mt-3 font-headline text-headline-sm text-on-surface-variant">
              Belum ada data pakan
            </Text>
            <Text className="mt-1 text-body-md text-on-surface-variant">
              Tekan Tambah Pakan untuk menambah data pakan baru
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {feeds.map((feed) => (
              <View
                key={feed._id}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <View className={`h-3 w-3 rounded-full ${FEED_TYPE_COLORS[feed.feed_type] || 'bg-outline'}`} />
                      <Text className="font-headline text-headline-sm font-bold text-on-surface">
                        {feed.feed_name}
                      </Text>
                    </View>
                    <Text className="mt-1 text-caption capitalize text-on-surface-variant">
                      {feed.feed_type} · {feed.source}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="rounded-full bg-primary-container/30 px-2.5 py-1">
                      <Text className="text-[11px] font-bold text-primary">
                        {feed.unit}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Nutrient Info */}
                <View className="mt-3 flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons name="water-percent" size={14} color="#707973" />
                    <Text className="text-caption text-on-surface-variant">
                      BK: {feed.dry_matter_pct}%
                    </Text>
                  </View>
                  {feed.crude_protein_pct != null && (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialCommunityIcons name="atom" size={14} color="#707973" />
                      <Text className="text-caption text-on-surface-variant">
                        PK: {feed.crude_protein_pct}%
                      </Text>
                    </View>
                  )}
                  {feed.metabolizable_energy != null && (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialCommunityIcons name="lightning-bolt" size={14} color="#707973" />
                      <Text className="text-caption text-on-surface-variant">
                        {feed.metabolizable_energy} kkal
                      </Text>
                    </View>
                  )}
                </View>

                {/* Price */}
                {feed.price_per_unit != null && feed.price_per_unit > 0 && (
                  <View className="mt-2 flex-row items-center gap-1.5">
                    <MaterialCommunityIcons name="cash" size={14} color="#707973" />
                    <Text className="text-caption font-semibold text-on-surface-variant">
                      Rp{feed.price_per_unit.toLocaleString('id-ID')}/{feed.unit}
                    </Text>
                  </View>
                )}

                {/* Active Status */}
                <View className="mt-2 flex-row items-center gap-1.5">
                  <View
                    className={`h-2 w-2 rounded-full ${
                      feed.is_active ? 'bg-status-active' : 'bg-outline'
                    }`}
                  />
                  <Text className="text-[11px] text-on-surface-variant">
                    {feed.is_active ? 'Aktif' : 'Nonaktif'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

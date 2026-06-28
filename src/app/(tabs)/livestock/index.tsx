// ─────────────────────────────────────────────────────────
// Daftar Ternak Screen — PRD Screen 3 spec
// ─────────────────────────────────────────────────────────

import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, TextInput, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useLivestockList } from '@/hooks/useLivestock';
import { LivestockCard } from '@/components/ui/LivestockCard';
import { BottomSheet } from '@/components/ui/BottomSheet';
import type { LivestockQuery, LivestockStatus, Species } from '@/types/livestock';

// ── Constants ──

const STATUS_FILTERS: { key: LivestockStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'sick', label: 'Sakit' },
  { key: 'quarantine', label: 'Karantina' },
];

const SPECIES_FILTERS: { key: Species | 'all'; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'kambing', label: 'Kambing' },
  { key: 'domba', label: 'Domba' },
  { key: 'sapi', label: 'Sapi' },
  { key: 'kerbau', label: 'Kerbau' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Terbaru Ditambahkan' },
  { key: 'ear_tag_asc', label: 'Ear Tag A → Z' },
  { key: 'weight_desc', label: 'Berat (Besar → Kecil)' },
  { key: 'quarantine_first', label: 'Status (Karantina Duluan)' },
];

const PAGE_SIZE = 20;

// ── Sub-components ──

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-9 shrink-0 items-center justify-center rounded-full px-4 ${
        active ? 'bg-primary-700' : 'border border-outline-variant bg-surface-container-lowest'
      }`}
    >
      <Text
        className={`font-label text-label-md font-semibold ${
          active ? 'text-white' : 'text-on-surface-variant'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LoadingFooter() {
  return (
    <View className="py-6">
      <ActivityIndicator size="small" color="#2D6A4F" />
    </View>
  );
}

// ── Main Screen ──

export default function LivestockListScreen() {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [activeSort, setActiveSort] = useState('newest');

  const [statusFilter, setStatusFilter] = useState<LivestockStatus | 'all'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'all'>('all');
  const [page, setPage] = useState(1);

  const [appliedSearch, setAppliedSearch] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setAppliedSearch(text);
      setPage(1);
    }, 300);
  }, []);

  // Map sort option key to API sort/order params
  const sortParams = useMemo(() => {
    switch (activeSort) {
      case 'ear_tag_asc': return { sort: 'ear_tag' as const, order: 'asc' as const };
      case 'weight_desc': return { sort: 'created_at' as const, order: 'desc' as const }; // weight sort not available server-side yet
      case 'quarantine_first': return { sort: 'created_at' as const, order: 'desc' as const }; // quarantine filter used separately
      default: return { sort: 'created_at' as const, order: 'desc' as const };
    }
  }, [activeSort]);

  const query: LivestockQuery = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(speciesFilter !== 'all' && { species: speciesFilter }),
      ...(appliedSearch.length > 0 && { search: appliedSearch }),
      ...sortParams,
    }),
    [page, statusFilter, speciesFilter, appliedSearch, sortParams],
  );

  const { data, isLoading, isFetching, isError } = useLivestockList(query);

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const hasMore = pagination ? page < pagination.totalPages : false;

  const onEndReached = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [hasMore, isFetching]);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header — PRD: title + search icon + filter/sort icon */}
      <View className="px-gutter py-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-headline text-headline-lg font-bold text-on-surface">
            Daftar Ternak
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSearchVisible((v) => !v)}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high"
            >
              <MaterialCommunityIcons
                name={searchVisible ? 'close' : 'magnify'}
                size={22}
                color="#404943"
              />
            </Pressable>
            <Pressable
              onPress={() => setSortSheetVisible(true)}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high"
            >
              <MaterialCommunityIcons name="tune" size={22} color="#404943" />
            </Pressable>
          </View>
        </View>

        {/* Search bar — expandable */}
        {searchVisible && (
          <View className="mb-3 flex-row items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3">
            <MaterialCommunityIcons name="magnify" size={20} color="#707973" />
            <TextInput
              autoFocus
              value={searchText}
              onChangeText={onSearchChange}
              placeholder="Cari ear tag, nama, ras..."
              placeholderTextColor="#A0A8A3"
              className="h-11 flex-1 font-body text-body-md text-on-surface"
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => onSearchChange('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#A0A8A3" />
              </Pressable>
            )}
          </View>
        )}

        {/* Filter chips — horizontal scrollable */}
        <View className="mb-1 gap-2">
          <FlatList
            horizontal
            data={STATUS_FILTERS}
            keyExtractor={(c) => c.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item: c }) => (
              <FilterChip
                label={c.label}
                active={statusFilter === c.key}
                onPress={() => { setStatusFilter(c.key); setPage(1); }}
              />
            )}
          />
          <FlatList
            horizontal
            data={SPECIES_FILTERS}
            keyExtractor={(c) => c.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            renderItem={({ item: c }) => (
              <FilterChip
                label={c.label}
                active={speciesFilter === c.key}
                onPress={() => { setSpeciesFilter(c.key); setPage(1); }}
              />
            )}
          />
        </View>

        {pagination && (
          <Text className="mb-1 font-caption text-caption text-on-surface-variant">
            {pagination.total} ternak ditemukan
          </Text>
        )}
      </View>

      {/* Livestock list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <LivestockCard
            item={item}
            onPress={() => router.push(`/(tabs)/livestock/${item._id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center py-16">
              <MaterialCommunityIcons name="cow" size={56} color="#D0D5D2" />
              <Text className="mt-3 font-headline text-body-lg font-semibold text-on-surface-variant">
                Belum ada ternak
              </Text>
              <Text className="mt-1 text-center font-body text-body-sm text-on-surface-variant">
                {appliedSearch || statusFilter !== 'all' || speciesFilter !== 'all'
                  ? 'Tidak ada ternak yang cocok dengan filter'
                  : 'Belum ada ternak terdaftar di peternakan ini'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={isFetching && page > 1 ? <LoadingFooter /> : null}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-2" />}
      />

      {/* Loading overlay */}
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-surface/60">
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <View className="absolute inset-0 items-center justify-center px-8">
          <MaterialCommunityIcons name="wifi-off" size={48} color="#D0D5D2" />
          <Text className="mt-3 text-center font-headline text-body-lg font-semibold text-on-surface-variant">
            Gagal memuat data
          </Text>
          <Text className="mt-1 text-center font-body text-body-sm text-on-surface-variant">
            Periksa koneksi ke server dan coba lagi
          </Text>
        </View>
      )}

      {/* FAB — "Tambah Ternak" */}
      <Pressable
        onPress={() => router.push('/(tabs)/livestock/add')}
        className="absolute bottom-[88px] right-gutter h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-95"
      >
        <MaterialCommunityIcons name="plus" size={30} color="#FFFFFF" />
      </Pressable>

      {/* Sort BottomSheet */}
      <BottomSheet
        visible={sortSheetVisible}
        onClose={() => setSortSheetVisible(false)}
        title="Urutkan"
      >
        <View className="gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => { setActiveSort(opt.key); setSortSheetVisible(false); }}
              className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                activeSort === opt.key
                  ? 'border-primary bg-primary/10'
                  : 'border-outline-variant bg-surface-container-lowest'
              }`}
            >
              <Text
                className={`text-body-md ${
                  activeSort === opt.key ? 'font-semibold text-primary' : 'text-on-surface'
                }`}
              >
                {opt.label}
              </Text>
              {activeSort === opt.key && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#2D6A4F" />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

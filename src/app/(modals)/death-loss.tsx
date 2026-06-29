// ─────────────────────────────────────────────────────────
// Death Loss Analysis Screen — kerugian ekonomi ternak mati
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useDeathLossRecords, useDeathLossSummary } from '@/hooks/useDeathLoss';

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatAge(days: number): string {
  if (days < 30) return `${days} hari`;
  if (days < 365) return `${Math.floor(days / 30)} bulan`;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return `${years} th ${months > 0 ? `${months} bln` : ''}`.trim();
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>
          <MaterialCommunityIcons name={icon as any} size={16} color={color} />
        </View>
        <Text className="text-caption font-medium text-on-surface-variant">{label}</Text>
      </View>
      <Text className="font-headline text-headline-md font-bold text-on-surface">{value}</Text>
    </View>
  );
}

export default function DeathLossScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const { data: records = [], isLoading: loadingRecords } = useDeathLossRecords();
  const { data: summary, isLoading: loadingSummary } = useDeathLossSummary();

  const periods = [
    { key: 'all', label: 'Semua' },
    { key: 'month', label: 'Bulan Ini' },
    { key: 'quarter', label: '3 Bulan' },
    { key: 'year', label: 'Tahun Ini' },
  ];

  const getFilteredRecords = useCallback(() => {
    if (selectedPeriod === 'all') return records;

    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return records;
    }

    return records.filter((r) => new Date(r.snapshot.death_date) >= startDate);
  }, [records, selectedPeriod]);

  const filteredRecords = getFilteredRecords();
  const filteredSummary = {
    total_count: filteredRecords.length,
    total_loss: filteredRecords.reduce((sum, r) => sum + (r.total_loss ?? 0), 0),
    average_loss: filteredRecords.length > 0
      ? filteredRecords.reduce((sum, r) => sum + (r.total_loss ?? 0), 0) / filteredRecords.length
      : 0,
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center bg-surface px-gutter py-sm shadow-sm">
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
        </Pressable>
        <Text className="flex-1 text-center pr-12 font-headline text-headline-md font-semibold text-on-surface">
          Death Loss Analysis
        </Text>
      </View>

      {loadingRecords || loadingSummary ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F5238" />
          <Text className="mt-3 text-body-md text-on-surface-variant">Memuat data...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Stats */}
          <View className="mb-6 gap-3">
            <View className="flex-row gap-3">
              <StatCard
                label="Total Kematian"
                value={filteredSummary.total_count}
                icon="heart-broken"
                color="#E63946"
              />
              <StatCard
                label="Total Kerugian"
                value={formatCurrency(filteredSummary.total_loss)}
                icon="cash-remove"
                color="#D32F2F"
              />
            </View>
            <StatCard
              label="Rata-rata Kerugian/Ekor"
              value={formatCurrency(filteredSummary.average_loss)}
              icon="calculator"
              color="#F57C00"
            />
          </View>

          {/* Period Filter */}
          <View className="mb-4 flex-row gap-2">
            {periods.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setSelectedPeriod(p.key)}
                className={`flex-1 rounded-lg py-2 ${
                  selectedPeriod === p.key
                    ? 'bg-primary'
                    : 'border border-outline-variant bg-surface-container-lowest'
                }`}
              >
                <Text
                  className={`text-center text-label-sm font-semibold ${
                    selectedPeriod === p.key ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Death by Cause */}
          {summary?.by_cause && summary.by_cause.length > 0 && (
            <View className="mb-6">
              <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Penyebab Kematian</Text>
              <View className="gap-2">
                {summary.by_cause.slice(0, 5).map((item) => (
                  <View key={item.cause} className="flex-row items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                    <MaterialCommunityIcons name="alert-circle" size={16} color="#E63946" />
                    <Text className="flex-1 text-body-md text-on-surface">{item.cause}</Text>
                    <View className="rounded-full bg-status-quarantine/10 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-status-quarantine">{item.count}x</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Death Records */}
          <View>
            <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Riwayat Kematian</Text>
            {filteredRecords.length === 0 ? (
              <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-12">
                <MaterialCommunityIcons name="check-circle" size={48} color="#52B788" />
                <Text className="mt-3 text-body-md font-semibold text-on-surface-variant">Tidak ada data kematian</Text>
              </View>
            ) : (
              <View className="gap-3">
                {filteredRecords.map((record) => (
                  <View
                    key={record._id}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
                  >
                    {/* Header */}
                    <View className="flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-status-quarantine/10">
                        <MaterialCommunityIcons name="heart-broken" size={22} color="#E63946" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline text-headline-sm font-bold text-on-surface">
                          #{record.livestock_id?.ear_tag} — {record.livestock_id?.name ?? record.snapshot.species}
                        </Text>
                        <Text className="text-caption text-on-surface-variant">
                          {record.snapshot.breed} · {record.snapshot.sex === 'male' ? 'Jantan' : 'Betina'}
                        </Text>
                      </View>
                    </View>

                    {/* Snapshot Info */}
                    <View className="mt-3 gap-1 rounded-lg bg-surface-muted p-3">
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Umur saat mati</Text>
                        <Text className="text-caption font-semibold text-on-surface">{formatAge(record.snapshot.age_at_death_days)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Berat terakhir</Text>
                        <Text className="text-caption font-semibold text-on-surface">{record.snapshot.last_weight_kg} kg</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Penyebab</Text>
                        <Text className="text-caption font-semibold text-status-quarantine">{record.snapshot.death_cause}</Text>
                      </View>
                    </View>

                    {/* Loss Breakdown */}
                    <View className="mt-3 gap-1 rounded-lg bg-[#FDECEA] p-3">
                      <Text className="mb-1 text-label-sm font-bold text-status-quarantine">Rincian Kerugian</Text>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Harga beli</Text>
                        <Text className="text-caption text-on-surface">{formatCurrency(record.investment_cost.purchase_price)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Biaya pakan</Text>
                        <Text className="text-caption text-on-surface">{formatCurrency(record.investment_cost.total_feed_cost)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Biaya obat</Text>
                        <Text className="text-caption text-on-surface">{formatCurrency(record.investment_cost.total_medicine_cost)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Biaya vaksin</Text>
                        <Text className="text-caption text-on-surface">{formatCurrency(record.investment_cost.total_vaccine_cost)}</Text>
                      </View>
                      <View className="border-t border-outline-variant pt-1 mt-1">
                        <View className="flex-row justify-between">
                          <Text className="text-label-sm font-bold text-on-surface">Total Investasi</Text>
                          <Text className="text-label-sm font-bold text-on-surface">{formatCurrency(record.investment_cost.total_investment)}</Text>
                        </View>
                      </View>
                      {record.market_value_loss.is_market_price_available && (
                        <View className="flex-row justify-between border-t border-outline-variant pt-1 mt-1">
                          <Text className="text-caption text-on-surface-variant">Nilai pasar hilang</Text>
                          <Text className="text-caption font-semibold text-on-surface">{formatCurrency(record.market_value_loss.estimated_market_value)}</Text>
                        </View>
                      )}
                      <View className="flex-row justify-between border-t border-status-quarantine/30 pt-1 mt-1">
                        <Text className="text-label-sm font-bold text-status-quarantine">Total Kerugian</Text>
                        <Text className="text-label-sm font-bold text-status-quarantine">{formatCurrency(record.total_loss)}</Text>
                      </View>
                    </View>

                    {record.calculation_notes && (
                      <Text className="mt-2 text-[10px] text-on-surface-variant italic">{record.calculation_notes}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

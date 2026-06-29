// ─────────────────────────────────────────────────────────
// Profitability per Ekor Screen — analisis untung/rugi ternak
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useProfitability, useMarketPrices } from '@/hooks/useProfitability';

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
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

export default function ProfitabilityScreen() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'profit' | 'loss' | 'weight'>('profit');

  const { data: profitability = [], isLoading: loadingProfitability } = useProfitability();
  const { data: marketPrices = [], isLoading: loadingPrices } = useMarketPrices();

  const sortedData = [...profitability].sort((a, b) => {
    switch (sortBy) {
      case 'profit': return b.estimated_profit - a.estimated_profit;
      case 'loss': return a.estimated_profit - b.estimated_profit;
      case 'weight': return b.current_weight_kg - a.current_weight_kg;
      default: return 0;
    }
  });

  const profitableCount = profitability.filter((p) => p.is_profitable).length;
  const unprofitableCount = profitability.filter((p) => !p.is_profitable).length;
  const totalProfit = profitability.reduce((sum, p) => sum + p.estimated_profit, 0);

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
          Profitabilitas Per Ekor
        </Text>
      </View>

      {loadingProfitability || loadingPrices ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F5238" />
          <Text className="mt-3 text-body-md text-on-surface-variant">Menghitung profitabilitas...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Market Price Info */}
          {marketPrices.length > 0 && (
            <View className="mb-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialCommunityIcons name="tag" size={16} color="#0F5238" />
                <Text className="text-label-sm font-bold text-on-surface">Harga Pasar Aktif</Text>
              </View>
              {marketPrices.filter(p => p.is_active).map((price) => (
                <View key={price._id} className="flex-row justify-between py-1">
                  <Text className="text-caption text-on-surface-variant">{price.category}</Text>
                  <Text className="text-caption font-semibold text-on-surface">{formatCurrency(price.price_per_kg)}/kg</Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary Stats */}
          <View className="mb-6 gap-3">
            <View className="flex-row gap-3">
              <StatCard
                label="Untung"
                value={profitableCount}
                icon="trending-up"
                color="#52B788"
              />
              <StatCard
                label="Rugi"
                value={unprofitableCount}
                icon="trending-down"
                color="#E63946"
              />
            </View>
            <StatCard
              label="Total Estimasi Keuntungan"
              value={formatCurrency(totalProfit)}
              icon="cash-multiple"
              color={totalProfit >= 0 ? '#52B788' : '#E63946'}
            />
          </View>

          {/* Sort Options */}
          <View className="mb-4 flex-row gap-2">
            {[
              { key: 'profit', label: 'Untung Tertinggi' },
              { key: 'loss', label: 'Rugi Terbesar' },
              { key: 'weight', label: 'Berat Terberat' },
            ].map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setSortBy(opt.key as any)}
                className={`flex-1 rounded-lg py-2 ${
                  sortBy === opt.key
                    ? 'bg-primary'
                    : 'border border-outline-variant bg-surface-container-lowest'
                }`}
              >
                <Text
                  className={`text-center text-[10px] font-semibold ${
                    sortBy === opt.key ? 'text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Profitability List */}
          {sortedData.length === 0 ? (
            <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-12">
              <MaterialCommunityIcons name="chart-bar" size={48} color="#D0D5D2" />
              <Text className="mt-3 text-body-md font-semibold text-on-surface-variant">Belum ada data</Text>
              <Text className="mt-1 text-caption text-on-surface-variant">Harga pasar belum dikonfigurasi</Text>
            </View>
          ) : (
            <View className="gap-3">
              {sortedData.map((item) => (
                <View
                  key={item.livestock_id}
                  className={`rounded-xl border p-4 shadow-sm ${
                    item.is_profitable
                      ? 'border-status-active/30 bg-surface-container-lowest'
                      : 'border-status-quarantine/30 bg-[#FFF5F5]'
                  }`}
                >
                  {/* Header */}
                  <View className="flex-row items-center gap-3">
                    <View className={`h-12 w-12 items-center justify-center rounded-full ${
                      item.is_profitable ? 'bg-status-active/10' : 'bg-status-quarantine/10'
                    }`}>
                      <MaterialCommunityIcons
                        name={item.is_profitable ? 'trending-up' : 'trending-down'}
                        size={22}
                        color={item.is_profitable ? '#52B788' : '#E63946'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-headline text-headline-sm font-bold text-on-surface">
                        #{item.ear_tag} — {item.name ?? ''}
                      </Text>
                      <Text className="text-caption text-on-surface-variant">
                        {item.current_weight_kg} kg · {formatCurrency(item.market_price_per_kg)}/kg
                      </Text>
                    </View>
                    <View className={`rounded-full px-3 py-1 ${
                      item.is_profitable ? 'bg-status-active/10' : 'bg-status-quarantine/10'
                    }`}>
                      <Text className={`text-[10px] font-bold ${
                        item.is_profitable ? 'text-status-active' : 'text-status-quarantine'
                      }`}>
                        {item.is_profitable ? 'UNTUNG' : 'RUGI'}
                      </Text>
                    </View>
                  </View>

                  {/* Financial Breakdown */}
                  <View className="mt-3 gap-1 rounded-lg bg-surface-muted p-3">
                    <View className="flex-row justify-between">
                      <Text className="text-caption text-on-surface-variant">Nilai jual estimasi</Text>
                      <Text className="text-caption font-semibold text-on-surface">{formatCurrency(item.estimated_market_value)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-caption text-on-surface-variant">Total investasi</Text>
                      <Text className="text-caption font-semibold text-on-surface">{formatCurrency(item.total_investment)}</Text>
                    </View>
                    <View className="border-t border-outline-variant pt-1 mt-1">
                      <View className="flex-row justify-between">
                        <Text className="text-label-sm font-bold text-on-surface">Estimasi keuntungan</Text>
                        <Text className={`text-label-sm font-bold ${
                          item.is_profitable ? 'text-status-active' : 'text-status-quarantine'
                        }`}>
                          {formatCurrency(item.estimated_profit)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Break-even Info */}
                  <View className="mt-3 flex-row items-center justify-between rounded-lg bg-[#FFF3E0] p-2">
                    <View className="flex-row items-center gap-1">
                      <MaterialCommunityIcons name="scale-bathroom" size={12} color="#F57C00" />
                      <Text className="text-[10px] font-semibold text-[#F57C00]">
                        Break-even: {item.break_even_weight_kg.toFixed(1)} kg
                      </Text>
                    </View>
                    <Text className="text-[10px] text-on-surface-variant">
                      {item.current_weight_kg >= item.break_even_weight_kg ? '✅ Sudah balik modal' : '⚠️ Belum balik modal'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

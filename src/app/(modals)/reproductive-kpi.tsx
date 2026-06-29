// ─────────────────────────────────────────────────────────
// Reproductive Performance KPI Screen — KPI reproduksi
// ─────────────────────────────────────────────────────────

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useReproductiveKPI } from '@/hooks/useReproductiveKpi';

function StatCard({ label, value, suffix, icon, color }: { label: string; value: string | number; suffix?: string; icon: string; color: string }) {
  return (
    <View className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}15` }}>
          <MaterialCommunityIcons name={icon as any} size={16} color={color} />
        </View>
        <Text className="text-caption font-medium text-on-surface-variant">{label}</Text>
      </View>
      <View className="flex-row items-end gap-1">
        <Text className="font-headline text-headline-md font-bold text-on-surface">{value}</Text>
        {suffix && <Text className="mb-0.5 text-caption text-on-surface-variant">{suffix}</Text>}
      </View>
    </View>
  );
}

export default function ReproductiveKPIScreen() {
  const router = useRouter();
  const { data: kpi, isLoading } = useReproductiveKPI();

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
          KPI Reproduksi
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F5238" />
          <Text className="mt-3 text-body-md text-on-surface-variant">Menghitung KPI...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Farm KPI Summary */}
          <View className="mb-6 gap-3">
            <View className="flex-row gap-3">
              <StatCard
                label="Conception Rate"
                value={kpi?.farm_kpi.conception_rate.toFixed(1) ?? '0'}
                suffix="%"
                icon="baby-face-outline"
                color="#9B5DE5"
              />
              <StatCard
                label="Kidding Rate"
                value={kpi?.farm_kpi.kidding_rate.toFixed(2) ?? '0'}
                suffix="anak/kelahiran"
                icon="baby-carriage"
                color="#0D9488"
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                label="Total Betina"
                value={kpi?.farm_kpi.total_doe ?? 0}
                suffix="ekor"
                icon="gender-female"
                color="#E63946"
              />
              <StatCard
                label="Total Kelahiran"
                value={kpi?.farm_kpi.total_births ?? 0}
                suffix="kelahiran"
                icon="hospital-box"
                color="#F57C00"
              />
            </View>
          </View>

          {/* KPI Reference */}
          <View className="mb-6">
            <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Acuan KPI Reproduksi</Text>
            <View className="gap-2">
              {[
                { label: 'Conception Rate', good: '≥ 75%', current: kpi?.farm_kpi.conception_rate ?? 0 },
                { label: 'Kidding Rate', good: '≥ 1.5', current: kpi?.farm_kpi.kidding_rate ?? 0 },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                  <MaterialCommunityIcons
                    name={item.label === 'Conception Rate' ? (item.current >= 75 ? 'check-circle' : 'alert-circle') : (item.current >= 1.5 ? 'check-circle' : 'alert-circle')}
                    size={16}
                    color={item.label === 'Conception Rate' ? (item.current >= 75 ? '#52B788' : '#F57C00') : (item.current >= 1.5 ? '#52B788' : '#F57C00')}
                  />
                  <Text className="flex-1 text-body-md text-on-surface">{item.label}</Text>
                  <Text className="text-body-md font-semibold text-on-surface-variant">Acuan: {item.good}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Low Performers */}
          {kpi?.low_performers && kpi.low_performers.length > 0 && (
            <View className="mb-6">
              <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Low Performers</Text>
              <View className="rounded-xl border border-status-quarantine/30 bg-[#FFF5F5] p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialCommunityIcons name="alert" size={16} color="#E63946" />
                  <Text className="text-label-sm font-bold text-status-quarantine">
                    {kpi.low_performers.length} betina dengan performa rendah
                  </Text>
                </View>
                {kpi.low_performers.map((doe) => (
                  <View key={doe.livestock_id} className="flex-row items-center gap-3 py-2 border-b border-status-quarantine/20 last:border-b-0">
                    <Text className="flex-1 text-body-md text-on-surface">#{doe.ear_tag} — {doe.name ?? ''}</Text>
                    <Text className="text-caption font-semibold text-status-quarantine">
                      CR: {doe.conception_rate.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* All Doe Performance */}
          <View>
            <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Performa Per Betina</Text>
            {kpi?.doe_performance && kpi.doe_performance.length > 0 ? (
              <View className="gap-2">
                {kpi.doe_performance.map((doe) => (
                  <View
                    key={doe.livestock_id}
                    className={`rounded-xl border p-4 shadow-sm ${
                      doe.is_low_performer
                        ? 'border-status-quarantine/30 bg-[#FFF5F5]'
                        : 'border-outline-variant bg-surface-container-lowest'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className={`h-10 w-10 items-center justify-center rounded-full ${
                        doe.is_low_performer ? 'bg-status-quarantine/10' : 'bg-status-active/10'
                      }`}>
                        <MaterialCommunityIcons
                          name={doe.is_low_performer ? 'alert' : 'check-circle'}
                          size={20}
                          color={doe.is_low_performer ? '#E63946' : '#52B788'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline text-body-md font-semibold text-on-surface">
                          #{doe.ear_tag} — {doe.name ?? ''}
                        </Text>
                        <Text className="text-caption text-on-surface-variant">
                          {doe.total_breeding_attempts} kawin · {doe.total_births} kelahiran · {doe.total_kids} anak
                        </Text>
                      </View>
                      <View className={`rounded-full px-2 py-0.5 ${
                        doe.conception_rate >= 75 ? 'bg-status-active/10' : 'bg-[#FFF3E0]'
                      }`}>
                        <Text className={`text-[10px] font-bold ${
                          doe.conception_rate >= 75 ? 'text-status-active' : 'text-[#F57C00]'
                        }`}>
                          CR: {doe.conception_rate.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-12">
                <MaterialCommunityIcons name="baby-face-outline" size={48} color="#D0D5D2" />
                <Text className="mt-3 text-body-md font-semibold text-on-surface-variant">Belum ada data</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

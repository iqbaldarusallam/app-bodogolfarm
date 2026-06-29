// ─────────────────────────────────────────────────────────
// Treatment Effectiveness Screen — analisis efektivitas obat
// ─────────────────────────────────────────────────────────

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useEffectivenessSummary } from '@/hooks/useTreatmentEffectiveness';

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

export default function TreatmentEffectivenessScreen() {
  const router = useRouter();
  const { data: summary, isLoading } = useEffectivenessSummary();

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
          Efektivitas Treatment
        </Text>
      </View>

      {isLoading ? (
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
                label="Total Treatment"
                value={summary?.total_treatments ?? 0}
                icon="medical-bag"
                color="#1565C0"
              />
              <StatCard
                label="Selesai"
                value={summary?.completed_treatments ?? 0}
                icon="check-circle"
                color="#52B788"
              />
            </View>
            <StatCard
              label="Kematian"
              value={summary?.death_count ?? 0}
              icon="heart-broken"
              color="#E63946"
            />
          </View>

          {/* Top Diagnoses */}
          <View className="mb-6">
            <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Diagnosa Terbanyak</Text>
            {summary?.top_diagnoses && summary.top_diagnoses.length > 0 ? (
              <View className="gap-2">
                {summary.top_diagnoses.slice(0, 8).map((item, index) => (
                  <View key={item.diagnosis} className="flex-row items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Text className="text-[10px] font-bold text-primary">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-body-md font-medium text-on-surface">{item.diagnosis}</Text>
                      <Text className="text-caption text-on-surface-variant">{item.count} kasus</Text>
                    </View>
                    {item.treatments > 0 && (
                      <View className="rounded-full bg-info-light px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-info">{item.treatments} treatment</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center rounded-xl border border-outline-variant py-8">
                <Text className="text-caption text-on-surface-variant">Belum ada data</Text>
              </View>
            )}
          </View>

          {/* Top Medicines */}
          <View className="mb-6">
            <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Obat Paling Sering Digunakan</Text>
            {summary?.top_medicines && summary.top_medicines.length > 0 ? (
              <View className="gap-2">
                {summary.top_medicines.map((item, index) => (
                  <View key={item.name} className="flex-row items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FFF3E0]">
                      <Text className="text-[10px] font-bold text-[#F57C00]">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-body-md font-medium text-on-surface">{item.name}</Text>
                    </View>
                    <View className="rounded-full bg-surface-container px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-on-surface-variant">{item.count}x</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center rounded-xl border border-outline-variant py-8">
                <Text className="text-caption text-on-surface-variant">Belum ada data</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View className="rounded-xl border border-info/30 bg-info-light p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialCommunityIcons name="information" size={16} color="#1565C0" />
              <Text className="text-label-sm font-bold text-info">Tentang Efektivitas</Text>
            </View>
            <Text className="text-caption text-on-surface-variant">
              Analisis ini menampilkan data dari health check dan treatment yang sudah dicatat. Semakin banyak data yang dicatat, semakin akurat analisisnya.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

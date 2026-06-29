// ─────────────────────────────────────────────────────────
// FCR/ADG Report Screen — efisiensi pakan dan pertumbuhan
// ─────────────────────────────────────────────────────────

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useFCRSummary } from '@/hooks/useFCR';

function getFCRColor(category: string): string {
  const map: Record<string, string> = {
    excellent: '#52B788',
    good: '#2E7D32',
    fair: '#F57C00',
    poor: '#E63946',
    insufficient_data: '#707973',
  };
  return map[category] ?? '#707973';
}

function getFCRLabel(category: string): string {
  const map: Record<string, string> = {
    excellent: 'Sangat Efisien',
    good: 'Efisien',
    fair: 'Cukup',
    poor: 'Tidak Efisien',
    insufficient_data: 'Data Tidak Cukup',
  };
  return map[category] ?? category;
}

function getFCRDescription(category: string): string {
  const map: Record<string, string> = {
    excellent: 'FCR < 6 — Sangat efisien dalam mengonversi pakan',
    good: 'FCR 6-8 — Efisien untuk kambing pedaging',
    fair: 'FCR 8-12 — Perlu evaluasi pakan/kandang',
    poor: 'FCR > 12 — Tidak efisien, perlu investigasi',
    insufficient_data: 'Data penimbangan tidak cukup',
  };
  return map[category] ?? '';
}

export default function FCRScreen() {
  const router = useRouter();
  const { data: summary, isLoading } = useFCRSummary();

  const records = summary?.records ?? [];
  const avgFCR = summary?.average_fcr ?? 0;
  const alertCount = summary?.alert_count ?? 0;

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
          FCR & ADG Report
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F5238" />
          <Text className="mt-3 text-body-md text-on-surface-variant">Memuat data FCR...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* FCR Summary Card */}
          <View className="mb-6 rounded-xl border border-primary bg-primary p-6 shadow-md">
            <View className="flex-row items-center gap-3 mb-4">
              <MaterialCommunityIcons name="scale-bathroom" size={28} color="#FFFFFF" />
              <Text className="font-headline text-headline-lg font-bold text-on-primary">Ringkasan FCR</Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-caption text-on-primary/70">FCR Rata-rata</Text>
                <Text className="font-display text-headline-xl font-bold text-on-primary">
                  {avgFCR > 0 ? avgFCR.toFixed(2) : '-'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-caption text-on-primary/70">Kandang Alert</Text>
                <Text className="font-display text-headline-xl font-bold text-on-primary">
                  {alertCount}
                </Text>
              </View>
            </View>
          </View>

          {/* FCR Reference */}
          <View className="mb-6">
            <Text className="mb-3 text-headline-sm font-semibold text-on-surface">Acuan FCR Kambing</Text>
            <View className="gap-2">
              {[
                { label: 'Sangat Efisien', range: '< 6', color: '#52B788' },
                { label: 'Efisien', range: '6 - 8', color: '#2E7D32' },
                { label: 'Cukup', range: '8 - 12', color: '#F57C00' },
                { label: 'Tidak Efisien', range: '> 12', color: '#E63946' },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                  <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <Text className="flex-1 text-body-md text-on-surface">{item.label}</Text>
                  <Text className="text-body-md font-semibold text-on-surface-variant">FCR {item.range}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* FCR Records by Cage */}
          <View>
            <Text className="mb-3 text-headline-sm font-semibold text-on-surface">FCR per Kandang</Text>
            {records.length === 0 ? (
              <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-12">
                <MaterialCommunityIcons name="chart-bar" size={48} color="#D0D5D2" />
                <Text className="mt-3 text-body-md font-semibold text-on-surface-variant">Belum ada data FCR</Text>
                <Text className="mt-1 text-caption text-on-surface-variant">Hitung FCR dari menu kalkulasi</Text>
              </View>
            ) : (
              <View className="gap-3">
                {records.map((record) => (
                  <View
                    key={record._id}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
                  >
                    {/* Header */}
                    <View className="flex-row items-center gap-3">
                      <View
                        className="h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${getFCRColor(record.fcr.category)}15` }}
                      >
                        <MaterialCommunityIcons
                          name="home"
                          size={22}
                          color={getFCRColor(record.fcr.category)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline text-headline-sm font-bold text-on-surface">
                          {record.cage_id?.pen_code ?? '-'}
                        </Text>
                        <Text className="text-caption text-on-surface-variant">
                          {record.period_days} hari · {record.feed_data.feed_record_count} feed record
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-3 py-1"
                        style={{ backgroundColor: `${getFCRColor(record.fcr.category)}15` }}
                      >
                        <Text
                          className="text-[10px] font-bold"
                          style={{ color: getFCRColor(record.fcr.category) }}
                        >
                          {getFCRLabel(record.fcr.category)}
                        </Text>
                      </View>
                    </View>

                    {/* FCR Value */}
                    <View className="mt-3 flex-row items-end gap-2">
                      <Text className="font-display text-headline-lg font-bold text-on-surface">
                        {record.fcr.value > 0 ? record.fcr.value.toFixed(2) : '-'}
                      </Text>
                      <Text className="mb-0.5 text-caption text-on-surface-variant">FCR</Text>
                    </View>
                    <Text className="text-caption text-on-surface-variant">
                      {getFCRDescription(record.fcr.category)}
                    </Text>

                    {/* Feed & Weight Data */}
                    <View className="mt-3 gap-1 rounded-lg bg-surface-muted p-3">
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Total pakan</Text>
                        <Text className="text-caption font-semibold text-on-surface">{record.feed_data.total_feed_kg.toFixed(1)} kg</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">Total kenaikan berat</Text>
                        <Text className="text-caption font-semibold text-on-surface">{record.weight_data.total_weight_gain_kg.toFixed(1)} kg</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-caption text-on-surface-variant">ADG rata-rata</Text>
                        <Text className="text-caption font-semibold text-status-active">
                          {record.weight_data.average_daily_gain_gram_per_head.toFixed(0)} g/hari
                        </Text>
                      </View>
                    </View>

                    {record.fcr.is_alert_triggered && (
                      <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-[#FDECEA] p-2">
                        <MaterialCommunityIcons name="alert" size={14} color="#D32F2F" />
                        <Text className="text-[10px] font-bold text-status-quarantine">
                          FCR {'>'} 12 — Perlu evaluasi pakan dan kandang
                        </Text>
                      </View>
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

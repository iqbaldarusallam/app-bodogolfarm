// ─────────────────────────────────────────────────────────
// Vaccination Protocol Screen — protokol vaksinasi standar
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useVaccinationProtocols,
  useCreateVaccinationProtocol,
  useDeleteVaccinationProtocol,
} from '@/hooks/useVaccinationProtocol';
import type { VaccinationProtocolItem } from '@/services/vaccinationProtocol';

function getGenderLabel(gender: string): string {
  const map: Record<string, string> = {
    male: 'Jantan',
    female: 'Betina',
    all: 'Semua',
  };
  return map[gender] ?? gender;
}

function getPriorityColor(priority: number): string {
  if (priority === 1) return '#E63946';
  if (priority === 2) return '#F57C00';
  return '#52B788';
}

export default function VaccinationProtocolScreen() {
  const router = useRouter();
  const { data: protocols = [], isLoading } = useVaccinationProtocols();
  const createProtocol = useCreateVaccinationProtocol();
  const deleteProtocol = useDeleteVaccinationProtocol();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_disease: '',
    interval_days: '',
    minimum_age_days: '',
    requires_booster: false,
    booster_interval_days: '',
    applicable_gender: 'all' as 'male' | 'female' | 'all',
    priority: '1',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.target_disease.trim()) newErrors.target_disease = 'Penyakit target wajib diisi';
    if (!formData.interval_days || parseInt(formData.interval_days) < 1) newErrors.interval_days = 'Minimal 1 hari';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const onSubmit = useCallback(() => {
    if (!validate()) return;
    createProtocol.mutate(
      {
        name: formData.name.trim(),
        target_disease: formData.target_disease.trim(),
        interval_days: parseInt(formData.interval_days),
        minimum_age_days: formData.minimum_age_days ? parseInt(formData.minimum_age_days) : 0,
        requires_booster: formData.requires_booster,
        booster_interval_days: formData.booster_interval_days ? parseInt(formData.booster_interval_days) : undefined,
        applicable_gender: formData.applicable_gender,
        priority: parseInt(formData.priority),
        notes: formData.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setFormData({
            name: '', target_disease: '', interval_days: '', minimum_age_days: '',
            requires_booster: false, booster_interval_days: '', applicable_gender: 'all',
            priority: '1', notes: '',
          });
          Alert.alert('Berhasil', 'Protokol vaksinasi ditambahkan');
        },
        onError: () => Alert.alert('Gagal', 'Gagal menambahkan protokol'),
      },
    );
  }, [validate, formData, createProtocol]);

  const handleDelete = useCallback(
    (protocol: VaccinationProtocolItem) => {
      Alert.alert(
        'Hapus Protokol',
        `Yakin ingin menghapus "${protocol.name}"?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => deleteProtocol.mutate(protocol._id),
          },
        ],
      );
    },
    [deleteProtocol],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
          </Pressable>
          <Text className="font-headline text-headline-lg font-bold text-primary">Protokol Vaksinasi</Text>
        </View>
        <Pressable
          onPress={() => setShowAddForm(!showAddForm)}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary"
        >
          <MaterialCommunityIcons name={showAddForm ? 'close' : 'plus'} size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Form */}
        {showAddForm && (
          <View className="mb-6 gap-3 rounded-xl border border-primary bg-surface p-4 shadow-md">
            <Text className="font-headline text-headline-sm font-bold text-primary">Tambah Protokol Baru</Text>

            <View className="gap-1">
              <Text className="text-label-sm text-on-surface-variant">Nama Protokol *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholder="Contoh: Protokol PPR Rutin"
                placeholderTextColor="#BFC9C1"
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
              />
              {errors.name && <Text className="text-caption text-error">{errors.name}</Text>}
            </View>

            <View className="gap-1">
              <Text className="text-label-sm text-on-surface-variant">Penyakit Target *</Text>
              <TextInput
                value={formData.target_disease}
                onChangeText={(v) => setFormData({ ...formData, target_disease: v })}
                placeholder="Contoh: PPR"
                placeholderTextColor="#BFC9C1"
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
              />
              {errors.target_disease && <Text className="text-caption text-error">{errors.target_disease}</Text>}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-label-sm text-on-surface-variant">Interval (hari) *</Text>
                <TextInput
                  value={formData.interval_days}
                  onChangeText={(v) => setFormData({ ...formData, interval_days: v })}
                  placeholder="365"
                  placeholderTextColor="#BFC9C1"
                  keyboardType="number-pad"
                  className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
                />
                {errors.interval_days && <Text className="text-caption text-error">{errors.interval_days}</Text>}
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-label-sm text-on-surface-variant">Umur Minimal (hari)</Text>
                <TextInput
                  value={formData.minimum_age_days}
                  onChangeText={(v) => setFormData({ ...formData, minimum_age_days: v })}
                  placeholder="0"
                  placeholderTextColor="#BFC9C1"
                  keyboardType="number-pad"
                  className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-label-sm text-on-surface-variant">Gender</Text>
                <View className="flex-row gap-2">
                  {(['all', 'male', 'female'] as const).map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setFormData({ ...formData, applicable_gender: g })}
                      className={`flex-1 rounded-lg py-2 ${
                        formData.applicable_gender === g ? 'bg-primary' : 'border border-outline-variant'
                      }`}
                    >
                      <Text className={`text-center text-[10px] font-semibold ${
                        formData.applicable_gender === g ? 'text-on-primary' : 'text-on-surface-variant'
                      }`}>
                        {getGenderLabel(g)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-label-sm text-on-surface-variant">Prioritas</Text>
                <View className="flex-row gap-2">
                  {['1', '2', '3'].map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 rounded-lg py-2 ${
                        formData.priority === p ? 'bg-primary' : 'border border-outline-variant'
                      }`}
                    >
                      <Text className={`text-center text-[10px] font-semibold ${
                        formData.priority === p ? 'text-on-primary' : 'text-on-surface-variant'
                      }`}>
                        {p === '1' ? 'Tinggi' : p === '2' ? 'Sedang' : 'Rendah'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setFormData({ ...formData, requires_booster: !formData.requires_booster })}
                className={`h-6 w-6 items-center justify-center rounded border ${
                  formData.requires_booster ? 'border-primary bg-primary' : 'border-outline-variant'
                }`}
              >
                {formData.requires_booster && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
              </Pressable>
              <Text className="text-body-md text-on-surface">Perlu Booster</Text>
            </View>

            {formData.requires_booster && (
              <View className="gap-1">
                <Text className="text-label-sm text-on-surface-variant">Interval Booster (hari)</Text>
                <TextInput
                  value={formData.booster_interval_days}
                  onChangeText={(v) => setFormData({ ...formData, booster_interval_days: v })}
                  placeholder="180"
                  placeholderTextColor="#BFC9C1"
                  keyboardType="number-pad"
                  className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
                />
              </View>
            )}

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowAddForm(false)}
                className="flex-1 h-10 items-center justify-center rounded-lg border border-outline"
              >
                <Text className="text-label-sm font-medium text-outline">Batal</Text>
              </Pressable>
              <Pressable
                onPress={onSubmit}
                disabled={createProtocol.isPending}
                className="flex-1 h-10 items-center justify-center rounded-lg bg-primary"
              >
                {createProtocol.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-label-sm font-bold text-on-primary">Simpan</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Protocol List */}
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#0F5238" />
          </View>
        ) : protocols.length === 0 ? (
          <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-12">
            <MaterialCommunityIcons name="needle" size={48} color="#D0D5D2" />
            <Text className="mt-3 text-body-md font-semibold text-on-surface-variant">Belum ada protokol</Text>
            <Text className="mt-1 text-caption text-on-surface-variant">Tambahkan protokol vaksinasi standar</Text>
          </View>
        ) : (
          <View className="gap-3">
            {protocols.map((protocol) => (
              <View
                key={protocol._id}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${getPriorityColor(protocol.priority)}15` }}
                  >
                    <MaterialCommunityIcons name="needle" size={20} color={getPriorityColor(protocol.priority)} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-headline text-body-md font-semibold text-on-surface">{protocol.name}</Text>
                    <Text className="text-caption text-on-surface-variant">{protocol.target_disease}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleDelete(protocol)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-status-quarantine/10"
                  >
                    <MaterialCommunityIcons name="delete-outline" size={16} color="#E63946" />
                  </Pressable>
                </View>

                <View className="mt-3 gap-1 rounded-lg bg-surface-muted p-3">
                  <View className="flex-row justify-between">
                    <Text className="text-caption text-on-surface-variant">Interval</Text>
                    <Text className="text-caption font-semibold text-on-surface">{protocol.interval_days} hari</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-caption text-on-surface-variant">Umur minimal</Text>
                    <Text className="text-caption font-semibold text-on-surface">{protocol.minimum_age_days} hari</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-caption text-on-surface-variant">Gender</Text>
                    <Text className="text-caption font-semibold text-on-surface">{getGenderLabel(protocol.applicable_gender)}</Text>
                  </View>
                  {protocol.requires_booster && (
                    <View className="flex-row justify-between">
                      <Text className="text-caption text-on-surface-variant">Booster</Text>
                      <Text className="text-caption font-semibold text-info">Setiap {protocol.booster_interval_days} hari</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

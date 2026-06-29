// ─────────────────────────────────────────────────────────
// Overhead Cost Screen — biaya overhead dan tenaga kerja
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import {
  useOverheadCosts,
  useOverheadCostSummary,
  useCreateOverheadCost,
  useDeleteOverheadCost,
} from '@/hooks/useOverheadCost';

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'tenaga_kerja', label: 'Tenaga Kerja', icon: 'account-group' },
  { key: 'utilitas', label: 'Utilitas', icon: 'flash' },
  { key: 'perawatan_kandang', label: 'Perawatan Kandang', icon: 'hammer-wrench' },
  { key: 'sewa_aset', label: 'Sewa Aset', icon: 'home-key' },
  { key: 'lainnya', label: 'Lainnya', icon: 'dots-horizontal' },
];

export default function OverheadCostScreen() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: costs = [], isLoading: loadingCosts } = useOverheadCosts();
  const { data: summary, isLoading: loadingSummary } = useOverheadCostSummary();
  const createCost = useCreateOverheadCost();
  const deleteCost = useDeleteOverheadCost();

  const onDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setExpenseDate(selectedDate);
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedCategory) newErrors.category = 'Pilih kategori';
    if (!description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Jumlah harus lebih dari 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedCategory, description, amount]);

  const onSubmit = useCallback(() => {
    if (!validate()) return;
    createCost.mutate(
      {
        category: selectedCategory,
        description: description.trim(),
        amount: parseFloat(amount),
        expense_date: expenseDate.toISOString(),
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setSelectedCategory('');
          setDescription('');
          setAmount('');
          setNotes('');
          Alert.alert('Berhasil', 'Biaya overhead ditambahkan');
        },
        onError: () => Alert.alert('Gagal', 'Gagal menambahkan biaya'),
      },
    );
  }, [validate, selectedCategory, description, amount, expenseDate, notes, createCost]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Hapus Biaya', 'Yakin ingin menghapus biaya ini?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteCost.mutate(id) },
      ]);
    },
    [deleteCost],
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
          <Text className="font-headline text-headline-lg font-bold text-primary">Biaya Overhead</Text>
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
        {/* Summary */}
        {!loadingSummary && summary && (
          <View className="mb-6 rounded-xl border border-primary bg-primary p-4 shadow-md">
            <Text className="mb-2 text-caption text-on-primary/80">Total Biaya Overhead</Text>
            <Text className="font-display text-headline-xl font-bold text-on-primary">
              {formatCurrency(summary.total_cost)}
            </Text>
            <Text className="mt-1 text-caption text-on-primary/80">{summary.count} transaksi</Text>
          </View>
        )}

        {/* Add Form */}
        {showAddForm && (
          <View className="mb-6 gap-3 rounded-xl border border-primary bg-surface p-4 shadow-md">
            <Text className="font-headline text-headline-sm font-bold text-primary">Tambah Biaya Baru</Text>

            {/* Category Selection */}
            <View className="gap-1">
              <Text className="text-label-sm text-on-surface-variant">Kategori *</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.key}
                    onPress={() => setSelectedCategory(cat.key)}
                    className={`flex-row items-center gap-1 rounded-lg border px-3 py-2 ${
                      selectedCategory === cat.key
                        ? 'border-primary bg-primary/10'
                        : 'border-outline-variant'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={14}
                      color={selectedCategory === cat.key ? '#0F5238' : '#707973'}
                    />
                    <Text className={`text-[10px] font-semibold ${
                      selectedCategory === cat.key ? 'text-primary' : 'text-on-surface-variant'
                    }`}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.category && <Text className="text-caption text-error">{errors.category}</Text>}
            </View>

            <View className="gap-1">
              <Text className="text-label-sm text-on-surface-variant">Deskripsi *</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Contoh: Gaji karyawan kandang"
                placeholderTextColor="#BFC9C1"
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
              />
              {errors.description && <Text className="text-caption text-error">{errors.description}</Text>}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-label-sm text-on-surface-variant">Jumlah (IDR) *</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#BFC9C1"
                  keyboardType="number-pad"
                  className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
                />
                {errors.amount && <Text className="text-caption text-error">{errors.amount}</Text>}
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-label-sm text-on-surface-variant">Tanggal</Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="h-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-3"
                >
                  <Text className="text-body-md text-on-surface">
                    {expenseDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </Pressable>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={expenseDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onDateChange}
              />
            )}

            <View className="gap-1">
              <Text className="text-label-sm text-on-surface-variant">Catatan</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Opsional"
                placeholderTextColor="#BFC9C1"
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md"
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowAddForm(false)}
                className="flex-1 h-10 items-center justify-center rounded-lg border border-outline"
              >
                <Text className="text-label-sm font-medium text-outline">Batal</Text>
              </Pressable>
              <Pressable
                onPress={onSubmit}
                disabled={createCost.isPending}
                className="flex-1 h-10 items-center justify-center rounded-lg bg-primary"
              >
                {createCost.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-label-sm font-bold text-on-primary">Simpan</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Cost List */}
        {loadingCosts ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#0F5238" />
          </View>
        ) : costs.length === 0 ? (
          <View className="items-center rounded-xl border border-outline-variant bg-surface-container-lowest py-12">
            <MaterialCommunityIcons name="cash-remove" size={48} color="#D0D5D2" />
            <Text className="mt-3 text-body-md font-semibold text-on-surface-variant">Belum ada biaya overhead</Text>
          </View>
        ) : (
          <View className="gap-2">
            {costs.map((cost) => {
              const catInfo = CATEGORIES.find((c) => c.key === cost.category);
              return (
                <View
                  key={cost._id}
                  className="flex-row items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
                    <MaterialCommunityIcons
                      name={(catInfo?.icon ?? 'cash') as any}
                      size={20}
                      color="#404943"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-headline text-body-md font-semibold text-on-surface">{cost.description}</Text>
                    <Text className="text-caption text-on-surface-variant">
                      {catInfo?.label ?? cost.category} · {formatDate(cost.expense_date)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-headline text-body-md font-bold text-on-surface">{formatCurrency(cost.amount)}</Text>
                    <Pressable onPress={() => handleDelete(cost._id)}>
                      <Text className="text-[10px] font-semibold text-status-quarantine">Hapus</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// Form Update Status Ternak — sesuai stitch design
// ─────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { createStatusChange } from '@/services/status';
import type { LivestockStatus } from '@/types/livestock';

// ── Constants ──

const STATUS_OPTIONS: {
  key: LivestockStatus;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { key: 'sold', label: 'Terjual', icon: 'currency-usd', color: '#6D6875', bg: 'bg-status-sold/10', border: 'border-status-sold' },
  { key: 'dead', label: 'Mati', icon: 'heart-broken', color: '#495057', bg: 'bg-status-dead/10', border: 'border-status-dead' },
  { key: 'transferred', label: 'Dipindah', icon: 'move-down', color: '#0F5238', bg: 'bg-secondary-container/30', border: 'border-secondary' },
];

const STATUS_LABELS: Record<LivestockStatus, string> = {
  active: 'Aktif',
  sick: 'Sakit',
  quarantine: 'Karantina',
  sold: 'Terjual',
  dead: 'Mati',
  transferred: 'Dipindah',
};

// ── Helpers ──

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Screen ──

export default function UpdateStatusScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    livestockId,
    earTag = '',
    animalName = '',
    currentStatus = 'active',
  } = useLocalSearchParams<{
    livestockId: string;
    earTag: string;
    animalName: string;
    currentStatus: string;
  }>();

  const [statusTo, setStatusTo] = useState<LivestockStatus | ''>('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [saleWeight, setSaleWeight] = useState('');
  const [saleBuyer, setSaleBuyer] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSold = statusTo === 'sold';

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!statusTo) newErrors.status = 'Pilih status tujuan';
    if (!reason.trim()) newErrors.reason = 'Alasan perubahan wajib diisi';
    if (isSold && (!salePrice || parseFloat(salePrice) < 0)) {
      newErrors.salePrice = 'Harga jual wajib diisi untuk status terjual';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [statusTo, reason, isSold, salePrice]);

  const onOpenConfirm = useCallback(() => {
    if (!validate()) return;
    setShowConfirmSheet(true);
  }, [validate]);

  // ── Mutation ──
  const mutation = useMutation({
    mutationFn: createStatusChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
      setShowConfirmSheet(false);
      router.back();
    },
    onError: (error: any) => {
      setShowConfirmSheet(false);
      const msg = error?.response?.data?.message ?? 'Gagal mengupdate status. Coba lagi.';
      setErrors({ submit: msg });
    },
  });

  const onConfirm = useCallback(() => {
    if (!statusTo) return;

    mutation.mutate({
      livestock_id: livestockId!,
      status_from: currentStatus as LivestockStatus,
      status_to: statusTo,
      changed_date: toISODate(eventDate),
      reason: reason.trim(),
      ...(isSold && salePrice ? { sale_price: parseFloat(salePrice) } : {}),
      ...(isSold && saleBuyer.trim() ? { sale_buyer: saleBuyer.trim() } : {}),
    });
  }, [statusTo, livestockId, currentStatus, eventDate, reason, isSold, salePrice, saleBuyer, mutation]);

  const onDateChange = useCallback((_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatepicker(Platform.OS === 'ios');
    if (selectedDate) setEventDate(selectedDate);
  }, []);

  const selectedStatusOption = STATUS_OPTIONS.find((s) => s.key === statusTo);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* ── Top AppBar ── */}
      <View className="flex-row items-center justify-between bg-surface px-gutter py-sm shadow-sm">
        <View className="flex-row items-center gap-md">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1B1B1D" />
          </Pressable>
          <Text className="font-headline text-headline-lg font-bold text-primary">Update Status</Text>
        </View>
        <MaterialCommunityIcons name="shield-check" size={22} color="#0F5238" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Animal Profile Header ── */}
        <View className="mb-6 flex-row items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <View className="h-20 w-20 items-center justify-center rounded-lg bg-surface-variant">
            <MaterialCommunityIcons name="paw" size={32} color="#0F5238" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-id-monospace uppercase text-on-surface-variant">
                ID: #{earTag}
              </Text>
              <View className="flex-row items-center gap-1.5 rounded-full border border-status-active/20 bg-status-active/10 px-2 py-0.5">
                <View className="h-2 w-2 rounded-full bg-status-active" />
                <Text className="text-label-md uppercase tracking-wider text-status-active">
                  {STATUS_LABELS[currentStatus as LivestockStatus] ?? currentStatus}
                </Text>
              </View>
            </View>
            <Text className="mt-1 font-headline text-headline-md text-on-surface">{animalName}</Text>
          </View>
        </View>

        {/* ── Status Selection Grid ── */}
        <View className="mb-6 gap-sm">
          <Text className="text-headline-sm text-on-surface-variant">Pilih Status Baru</Text>
          <View className="flex-row gap-md">
            {STATUS_OPTIONS.map((opt) => {
              const selected = statusTo === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setStatusTo(opt.key)}
                  className={`flex-1 items-center gap-2 rounded-xl border-2 py-4 ${
                    selected
                      ? `${opt.border} border-2 bg-brand-surface`
                      : 'border-transparent bg-surface-container'
                  }`}
                >
                  <View className={`h-12 w-12 items-center justify-center rounded-full ${opt.bg}`}>
                    <MaterialCommunityIcons name={opt.icon as any} size={24} color={opt.color} />
                  </View>
                  <Text className="text-label-md font-medium text-on-surface">{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.status && <Text className="text-caption text-error">{errors.status}</Text>}
        </View>

        {/* ── Form Inputs ── */}
        <View className="gap-md">
          {/* Date of Event */}
          <View className="gap-1">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Tanggal Kejadian</Text>
            <Pressable
              onPress={() => setShowDatepicker(true)}
              className="flex-row h-12 items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low px-4"
            >
              <Text className="text-body-md text-on-surface">{formatDisplayDate(eventDate)}</Text>
              <MaterialCommunityIcons name="calendar-today" size={18} color="#707973" />
            </Pressable>
            {showDatepicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Conditional Sold Fields */}
          {isSold && (
            <View className="gap-md rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <View className="flex-row gap-md">
                <View className="flex-1 gap-1">
                  <Text className="text-label-md font-medium text-on-surface-variant">Harga (IDR)</Text>
                  <TextInput
                    value={salePrice}
                    onChangeText={setSalePrice}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#BFC9C1"
                    className="h-12 rounded-xl border border-outline-variant bg-surface-container-low px-4 text-body-md text-on-surface"
                  />
                  {errors.salePrice && <Text className="text-caption text-error">{errors.salePrice}</Text>}
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-label-md font-medium text-on-surface-variant">Berat (kg)</Text>
                  <TextInput
                    value={saleWeight}
                    onChangeText={setSaleWeight}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#BFC9C1"
                    className="h-12 rounded-xl border border-outline-variant bg-surface-container-low px-4 text-body-md text-on-surface"
                  />
                </View>
              </View>
              <View className="gap-1">
                <Text className="text-label-md font-medium text-on-surface-variant">Nama Pembeli</Text>
                <TextInput
                  value={saleBuyer}
                  onChangeText={setSaleBuyer}
                  placeholder="e.g. Rumah Potong Bodogol"
                  placeholderTextColor="#BFC9C1"
                  className="h-12 rounded-xl border border-outline-variant bg-surface-container-low px-4 text-body-md text-on-surface"
                />
              </View>
            </View>
          )}

          {/* Reason */}
          <View className="gap-1">
            <Text className="text-label-md font-medium text-on-surface-variant px-1">Alasan / Catatan</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              placeholder="Deskripsikan alasan perubahan status..."
              placeholderTextColor="#BFC9C1"
              className="min-h-[80px] rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-md text-on-surface focus:border-primary"
              textAlignVertical="top"
            />
            {errors.reason && <Text className="text-caption text-error">{errors.reason}</Text>}
          </View>
        </View>

        {/* Submit error */}
        {errors.submit && (
          <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-error-container bg-error-container/30 p-3">
            <MaterialCommunityIcons name="alert-circle" size={18} color="#BA1A1A" />
            <Text className="flex-1 text-body-sm text-error">{errors.submit}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Fixed Action Bar ── */}
      <View className="flex-row gap-3 border-t border-outline-variant bg-surface-container-lowest px-gutter py-md">
        <Pressable
          onPress={() => router.back()}
          className="flex-1 h-12 items-center justify-center rounded-xl border border-outline"
        >
          <Text className="text-headline-sm font-medium text-outline">Batal</Text>
        </Pressable>
        <Pressable
          onPress={onOpenConfirm}
          className="flex-1 h-12 items-center justify-center rounded-xl bg-primary shadow-lg active:scale-[0.98]"
        >
          <Text className="text-headline-sm font-bold text-on-primary">Update Status</Text>
        </Pressable>
      </View>

      {/* ── Confirmation Bottom Sheet ── */}
      <Modal
        visible={showConfirmSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmSheet(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={() => setShowConfirmSheet(false)} />
          <View className="rounded-t-3xl bg-surface-container-lowest px-gutter pb-xl pt-4">
            {/* Handle */}
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-outline-variant" />

            {/* Warning icon */}
            <View className="mb-4 items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-error-container/20">
                <MaterialCommunityIcons name="information" size={32} color="#BA1A1A" />
              </View>
            </View>

            {/* Title & description */}
            <View className="mb-6 items-center gap-2">
              <Text className="font-headline text-headline-lg font-bold text-on-surface">
                Konfirmasi Update Status?
              </Text>
              <Text className="text-center text-body-md text-on-surface-variant">
                Anda akan mengubah <Text className="font-bold">#{earTag}</Text> ke{' '}
                <Text className="font-bold text-on-surface">
                  {STATUS_LABELS[statusTo as LivestockStatus]}
                </Text>. Tindakan ini akan mengarsipkan data ternak.
              </Text>
            </View>

            {/* Summary card */}
            <View className="mb-6 gap-3 rounded-xl bg-surface-muted p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-label-md text-on-surface-variant">Status Baru</Text>
                <Text className={`text-headline-sm font-bold`} style={{ color: selectedStatusOption?.color }}>
                  {STATUS_LABELS[statusTo as LivestockStatus]}
                </Text>
              </View>
              {isSold && saleBuyer.trim() && (
                <View className="flex-row items-center justify-between border-t border-outline-variant pt-3">
                  <Text className="text-label-md text-on-surface-variant">Pembeli</Text>
                  <Text className="text-headline-sm font-medium text-on-surface">{saleBuyer}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View className="gap-3">
              <Pressable
                onPress={onConfirm}
                disabled={mutation.isPending}
                className="h-14 items-center justify-center rounded-xl border-2 border-error active:scale-[0.98]"
              >
                {mutation.isPending ? (
                  <ActivityIndicator size="small" color="#BA1A1A" />
                ) : (
                  <Text className="text-headline-md font-bold text-error">
                    Konfirmasi & Arsipkan
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => setShowConfirmSheet(false)}
                className="h-12 items-center justify-center"
              >
                <Text className="text-label-md text-on-surface-variant">Tetap Edit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

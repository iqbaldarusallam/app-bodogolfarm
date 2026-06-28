// ─────────────────────────────────────────────────────────
// Ganti Password — PRD Settings
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import { changePassword } from '@/services/auth';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => changePassword(current, next),
    onSuccess: () => {
      Alert.alert('Berhasil', 'Password berhasil diubah.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      const msg = err?.message || 'Gagal mengubah password.';
      setErrors({ submit: msg });
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!current) e.current = 'Password lama wajib diisi';
    if (!next) e.next = 'Password baru wajib diisi';
    else if (next.length < 8) e.next = 'Password baru minimal 8 karakter';
    if (next && confirm !== next) e.confirm = 'Konfirmasi password tidak cocok';
    if (next && next === current) e.next = 'Password baru harus berbeda dari yang lama';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    setErrors({});
    if (!validate()) return;
    mutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View className="flex-row items-center gap-md bg-surface px-gutter py-sm shadow-sm">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F5238" />
        </Pressable>
        <Text className="font-headline text-headline-md font-bold text-primary">Ganti Password</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          {/* Current */}
          <Field
            label="Password Lama"
            value={current}
            onChangeText={setCurrent}
            secure={!show}
            error={errors.current}
            placeholder="Masukkan password saat ini"
          />
          {/* New */}
          <Field
            label="Password Baru"
            value={next}
            onChangeText={setNext}
            secure={!show}
            error={errors.next}
            placeholder="Minimal 8 karakter"
          />
          {/* Confirm */}
          <Field
            label="Konfirmasi Password Baru"
            value={confirm}
            onChangeText={setConfirm}
            secure={!show}
            error={errors.confirm}
            placeholder="Ulangi password baru"
          />

          {/* Show toggle */}
          <Pressable onPress={() => setShow((v) => !v)} className="flex-row items-center gap-2 self-start">
            <MaterialCommunityIcons name={show ? 'eye-off' : 'eye'} size={18} color="#707973" />
            <Text className="text-label-md text-on-surface-variant">
              {show ? 'Sembunyikan password' : 'Tampilkan password'}
            </Text>
          </Pressable>

          {/* Submit error */}
          {errors.submit && (
            <View className="flex-row items-center gap-2 rounded-lg border border-error-container bg-error-container/30 p-3">
              <MaterialCommunityIcons name="alert-circle" size={16} color="#BA1A1A" />
              <Text className="flex-1 text-caption text-error">{errors.submit}</Text>
            </View>
          )}

          {/* Submit */}
          <Pressable
            onPress={onSubmit}
            disabled={mutation.isPending}
            className={`mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl shadow-md active:scale-[0.98] ${
              mutation.isPending ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="lock-check" size={20} color="#FFFFFF" />
            )}
            <Text className="font-headline text-headline-sm font-bold text-on-primary">
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  secure,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure: boolean;
  error?: string;
  placeholder?: string;
}) {
  return (
    <View className="gap-1">
      <Text className="px-1 text-label-md font-medium text-on-surface-variant">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize="none"
        placeholder={placeholder}
        placeholderTextColor="#BFC9C1"
        className="h-[48px] rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface"
      />
      {error && <Text className="text-caption text-error">{error}</Text>}
    </View>
  );
}

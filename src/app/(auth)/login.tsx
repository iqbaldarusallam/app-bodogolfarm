// ─────────────────────────────────────────────────────────
// Login Screen — PRD Screen 1 spec
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import * as authService from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');

    if (!email.trim()) {
      setError('Username atau email wajib diisi');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });
      setAuth(result.user, result.token, result.refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Username atau password salah';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Subtle gradient background: neutral-50 → primary-50 */}
      <View className="absolute inset-0 bg-gradient-to-b from-neutral-100 via-surface to-primary-50 opacity-70" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-between px-gutter py-xl">
            {/* Top section — Logo + Name */}
            <View className="items-center pt-20">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-md">
                <MaterialCommunityIcons name="paw" size={44} color="#FFFFFF" />
              </View>
              <Text className="text-center font-display text-display font-bold text-primary">
                Bodogol Farm
              </Text>
              <Text className="mt-1 text-center font-body text-body-md text-on-surface-variant">
                Livestock Recording System
              </Text>
            </View>

            {/* Divider */}
            <View className="my-lg flex-row items-center gap-3 px-xl">
              <View className="h-px flex-1 bg-outline-variant" />
              <Text className="font-caption text-caption text-on-surface-variant">🌿</Text>
              <View className="h-px flex-1 bg-outline-variant" />
            </View>

            {/* Middle section — Form */}
            <View className="gap-lg pt-xl">
              {/* Error banner */}
              {error ? (
                <View className="flex-row items-center gap-2 rounded-xl border border-danger bg-danger-light px-4 py-3">
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#BA1A1A" />
                  <Text className="flex-1 font-body text-body-md text-danger">{error}</Text>
                </View>
              ) : null}

              <Input
                label="Username / Email"
                placeholder="Masukkan email atau ID"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
                leftIcon="account-outline"
              />

              <Input
                label="Kata Sandi"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                isPassword
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                leftIcon="lock-outline"
              />

              <Button
                title="Masuk"
                onPress={handleLogin}
                loading={isLoading}
                rightIcon="arrow-right"
                className="shadow-lg"
              />
            </View>

            {/* Bottom section — Version */}
            <View className="items-center pt-lg pb-4">
              <Text className="text-center font-caption text-caption text-on-surface-variant opacity-60">
                v1.0.0 · Bodogol Farm
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// Auth stack layout — tanpa header, tanpa tab bar
// ─────────────────────────────────────────────────────────

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Stack untuk tab "Ternak": index (list) → add / [id] (detail)
// Tanpa _layout ini, add & [id] bocor jadi tab terpisah di bar bawah.
// ─────────────────────────────────────────────────────────

import { Stack } from 'expo-router';

export default function LivestockStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

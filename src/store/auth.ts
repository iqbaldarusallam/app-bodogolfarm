// ─────────────────────────────────────────────────────────
// Auth store — Zustand + SecureStore (tokens) + AsyncStorage (user)
// ─────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { User } from '@/types/auth';

// ── Token keys ──
const TOKEN_KEY = 'bodogol_access_token';
const REFRESH_TOKEN_KEY = 'bodogol_refresh_token';

// ── Platform-safe secure storage ──
// expo-secure-store hanya tersedia di native (Android/iOS). Di web fallback
// ke AsyncStorage (localStorage) agar tidak crash saat testing di browser.
const isWeb = Platform.OS === 'web';

async function secureSet(key: string, value: string): Promise<void> {
  if (isWeb) return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}
async function secureGet(key: string): Promise<string | null> {
  if (isWeb) return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}
async function secureDelete(key: string): Promise<void> {
  if (isWeb) return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

// ── Token helpers (used before Zustand rehydrates) ──
export async function loadTokensFromSecureStore(): Promise<{ token: string | null; refreshToken: string | null }> {
  const [token, refreshToken] = await Promise.all([
    secureGet(TOKEN_KEY),
    secureGet(REFRESH_TOKEN_KEY),
  ]);
  return { token, refreshToken };
}

export async function saveTokensToSecureStore(token: string, refreshToken: string): Promise<void> {
  await Promise.all([
    secureSet(TOKEN_KEY, token),
    secureSet(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokensFromSecureStore(): Promise<void> {
  await Promise.all([
    secureDelete(TOKEN_KEY),
    secureDelete(REFRESH_TOKEN_KEY),
  ]);
}

// ── Auth store ──
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
      (set, get) => ({
        // ── Initial state ──
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        _hasHydrated: false,

        // ── Actions ──
        setAuth: async (user, token, refreshToken) => {
          await saveTokensToSecureStore(token, refreshToken);
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
          });
        },

        setTokens: async (token, refreshToken) => {
          await saveTokensToSecureStore(token, refreshToken);
          set({ token, refreshToken });
        },

        setUser: (user) => set({ user }),

        setLoading: (isLoading) => set({ isLoading }),

        setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

        logout: async () => {
          await clearTokensFromSecureStore();
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        },
      }),
      {
        name: 'bodogol-auth',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => {
          return (state) => {
            state?.setHasHydrated(true);
          };
        },
      },
    ),
  );

// ─────────────────────────────────────────────────────────
// Auth store — Zustand + SecureStore (tokens) + AsyncStorage (user)
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { User } from '@/types/auth';

// ── SecureStore keys for tokens ──
const TOKEN_KEY = 'bodogol_access_token';
const REFRESH_TOKEN_KEY = 'bodogol_refresh_token';

// ── Token helpers (used before Zustand rehydrates) ──
export async function loadTokensFromSecureStore(): Promise<{ token: string | null; refreshToken: string | null }> {
  const [token, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  return { token, refreshToken };
}

export async function saveTokensToSecureStore(token: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokensFromSecureStore(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
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

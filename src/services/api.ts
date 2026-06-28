// ─────────────────────────────────────────────────────────
// Axios instance — base config & interceptors
// ─────────────────────────────────────────────────────────

import axios, { create } from 'axios';
import Constants from 'expo-constants';

import { useAuthStore } from '@/store/auth';

// Auto-detect API host dari Expo dev server
// Bekerja untuk: emulator, simulator, HP fisik via Expo Go
function getBaseUrl(): string {
  // Saat development, Expo tahu IP host yang dipakai
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    // debuggerHost = "192.168.x.x:8081" → ambil IP saja, pakai port 3000
    const host = debuggerHost.split(':')[0];
    return `http://${host}:3000/api`;
  }

  // Fallback production / build
  return 'http://localhost:3000/api';
}

const BASE_URL = getBaseUrl();

export const api = create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach token ──
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — handle 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika 401 & belum retry, coba refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = data.data;
        useAuthStore.getState().setTokens(token, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    // Tidak ada response = masalah jaringan/timeout (app ini online-only).
    if (!error.response) {
      error.message = 'Tidak ada koneksi ke server. Periksa internet kamu lalu coba lagi.';
    }

    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────
// Color tokens berdasarkan PRD Livestock Recording
// ─────────────────────────────────────────────────────────

export const colors = {
  // ── Primary (Earth tones - hijau gelap) ──
  primary: {
    50: '#F0F7F0',
    100: '#D4EDDA',
    200: '#A8D5B3',
    300: '#7CBD8C',
    400: '#50A565',
    500: '#2D8B4E', // primary
    600: '#236F3E',
    700: '#1A5330',
    800: '#113821',
    900: '#081C11',
  },

  // ── Secondary (Coklat tanah) ──
  secondary: {
    50: '#FDF8F3',
    100: '#F5E6D3',
    200: '#EBCCA7',
    300: '#E1B37B',
    400: '#D7994F',
    500: '#C47F33', // secondary
    600: '#9D6529',
    700: '#764C1F',
    800: '#4E3214',
    900: '#27190A',
  },

  // ── Status Colors (sesuai PRD) ──
  status: {
    active: '#22C55E',      // hijau - ternak aktif/sehat
    sick: '#EAB308',         // kuning - ternak sakit
    quarantine: '#F97316',   // orange - karantina
    sold: '#6B7280',         // abu-abu - terjual
    dead: '#EF4444',         // merah - mati
    transferred: '#3B82F6',  // biru - dipindahkan
  },

  // ── Semantic Colors ──
  success: {
    light: '#DCFCE7',
    default: '#22C55E',
    dark: '#166534',
  },
  warning: {
    light: '#FEF9C3',
    default: '#EAB308',
    dark: '#854D0E',
  },
  danger: {
    light: '#FEE2E2',
    default: '#EF4444',
    dark: '#991B1B',
  },
  info: {
    light: '#DBEAFE',
    default: '#3B82F6',
    dark: '#1E40AF',
  },

  // ── Neutral ──
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // ── Background ──
  background: {
    light: '#FFFFFF',
    dark: '#111827',
    card: '#F9FAFB',
    elevated: '#FFFFFF',
  },

  // ── Text ──
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#2D8B4E',
  },

  // ── Border ──
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

export type StatusColor = keyof typeof colors.status;

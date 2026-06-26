// ─────────────────────────────────────────────────────────
// Border radius tokens
// ─────────────────────────────────────────────────────────

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ── Pre-defined radius untuk komponen ──
export const componentRadius = {
  // Cards
  card: radius.lg,           // 12
  cardSmall: radius.md,      // 8

  // Buttons
  button: radius.md,         // 8
  buttonFull: radius.full,   // pill shape

  // Inputs
  input: radius.md,          // 8

  // Badges
  badge: radius.full,        // pill shape

  // Avatars
  avatar: radius.full,       // circle

  // Modals/Sheets
  modal: radius.xl,          // 16
  bottomSheet: radius.xl,    // 16

  // Images
  image: radius.lg,          // 12
  imageSmall: radius.md,     // 8
} as const;

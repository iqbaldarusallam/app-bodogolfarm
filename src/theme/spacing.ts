// ─────────────────────────────────────────────────────────
// Spacing scale berdasarkan PRD
// Touch target minimal 44px untuk field usage
// ─────────────────────────────────────────────────────────

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44, // minimal touch target
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// ── Pre-defined spacing untuk layout ──
export const layout = {
  // Padding standar
  screenPaddingHorizontal: spacing[4],  // 16
  screenPaddingVertical: spacing[4],    // 16
  cardPadding: spacing[4],              // 16
  sectionPadding: spacing[5],           // 20

  // Gap antar elemen
  gapXs: spacing[1],   // 4
  gapSm: spacing[2],   // 8
  gapMd: spacing[3],   // 12
  gapLg: spacing[4],   // 16
  gapXl: spacing[6],   // 24

  // Margin
  marginBottom: spacing[4],   // 16
  marginSection: spacing[6],  // 24

  // Touch target
  touchTargetMin: spacing[11], // 44

  // Bottom tab inset
  bottomTabInset: 50,
  maxContentWidth: 800,
} as const;

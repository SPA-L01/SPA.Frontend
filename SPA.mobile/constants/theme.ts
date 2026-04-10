/**
 * SPA Parking App — Design Tokens
 * Based on Figma mockup analysis: dark header + light content + black accents
 */

import { Platform } from 'react-native';

// ─── Core Palette ────────────────────────────────────────────────
export const palette = {
  black: '#0D0D0D',
  darkBg: '#1A1A1E',
  darkBg2: '#2C2C2E',
  darkCard: '#3A3A3C',
  white: '#FFFFFF',
  offWhite: '#F2F2F7',
  lightCard: '#FFFFFF',
  border: '#E5E5EA',
  borderDark: '#48484A',

  textPrimary: '#0D0D0D',
  textSecondary: '#8E8E93',
  textLight: '#FFFFFF',
  textMuted: '#AEAEB2',

  accent: '#0D0D0D',
  accentLight: '#F2F2F7',
  mapMarker: '#111111',

  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
};

// ─── Semantic Colors (light / dark mode) ─────────────────────────
export const Colors = {
  light: {
    text: palette.textPrimary,
    background: palette.offWhite,
    tint: palette.black,
    icon: palette.textSecondary,
    tabIconDefault: palette.textSecondary,
    tabIconSelected: palette.white,
    tabBar: palette.darkBg,
    card: palette.lightCard,
    border: palette.border,
    headerBg: palette.darkBg,
    headerText: palette.white,
  },
  dark: {
    text: palette.textLight,
    background: palette.darkBg,
    tint: palette.white,
    icon: palette.textMuted,
    tabIconDefault: palette.textMuted,
    tabIconSelected: palette.white,
    tabBar: palette.darkBg,
    card: palette.darkCard,
    border: palette.borderDark,
    headerBg: palette.darkBg,
    headerText: palette.white,
  },
};

// ─── Spacing ─────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius ────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// ─── Typography ───────────────────────────────────────────────────
export const typography = {
  hero: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h1: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h2: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  h3: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
};

// ─── Shadows ──────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui' },
  default: { sans: 'normal' },
  web: { sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
});

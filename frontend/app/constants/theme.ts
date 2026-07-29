/**
 * Infantia Theme — Pastel color palette
 * Cards/tiles UI for web + mobile (Expo/React Native)
 */

export const Colors = {
  // Backgrounds
  background: '#F5F3F0',       // warm off-white
  cardBackground: '#FFFFFF',

  // Pastel palette
  pastelGray: '#C9C9C9',
  pastelLilla: '#C8A2C8',
  pastelSand: '#E8DCC8',
  pastelBrown: '#C4A882',
  pastelGreen: '#B8D8B8',

  // Card accent colors (slightly deeper for readability)
  accentGray: '#8A8A8A',
  accentLilla: '#9B6B9B',
  accentSand: '#C4A66E',
  accentBrown: '#9B7E56',
  accentGreen: '#6BAF6B',

  // Text
  textPrimary: '#3D3D3D',
  textSecondary: '#7A7A7A',
  textOnAccent: '#FFFFFF',

  // Status
  success: '#6BAF6B',
  warning: '#C4A66E',
  danger: '#C87676',

  // Borders & dividers
  border: '#E0DCD6',
  divider: '#EDEBE8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  subtitle: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  cardTitle: { fontSize: 17, fontWeight: '600' as const },
  cardDetail: { fontSize: 14, fontWeight: '400' as const },
};

// Card type config — maps each section to its colors & icon
export const CardConfig = {
  master: {
    accent: Colors.pastelGreen,
    accentDark: Colors.accentGreen,
    icon: '👶' as const,
    label: 'Child Info',
  },
  vaccines: {
    accent: Colors.pastelLilla,
    accentDark: Colors.accentLilla,
    icon: '💉' as const,
    label: 'Vaccines',
  },
  diseases: {
    accent: Colors.pastelSand,
    accentDark: Colors.accentSand,
    icon: '🤒' as const,
    label: 'Diseases',
  },
  injuries: {
    accent: Colors.pastelBrown,
    accentDark: Colors.accentBrown,
    icon: '🩹' as const,
    label: 'Injuries',
  },
  medicines: {
    accent: Colors.pastelGray,
    accentDark: Colors.accentGray,
    icon: '💊' as const,
    label: 'Medicine',
  },
} as const;

export type CardType = keyof typeof CardConfig;
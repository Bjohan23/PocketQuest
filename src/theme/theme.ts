/**
 * Sistema de Tema Centralizado - Pocket Quest
 * Paleta de colores moderna y tokens de diseño
 */

import { TextStyle, ViewStyle } from 'react-native';

// ============================
// PALETA DE COLORES
// ============================

export const Colors = {
  // Colores primarios
  primary: '#7C4DFF', // Violeta moderno
  primaryDark: '#651FFF',
  primaryLight: '#B388FF',

  // Colores secundarios
  secondary: '#FF9800', // Naranja vibrante
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',

  // Colores de estado
  success: '#4CAF50',
  successDark: '#388E3C',
  successLight: '#81C784',

  warning: '#FF9800',
  warningDark: '#F57C00',
  warningLight: '#FFB74D',

  danger: '#FF5252',
  dangerDark: '#D32F2F',
  dangerLight: '#FF867C',

  info: '#2196F3',
  infoDark: '#1976D2',
  infoLight: '#64B5F6',

  // Colores de fondo
  background: '#F8F9FA',
  backgroundDark: '#F0F2F5',

  // Colores de superficie
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',

  // Colores de texto
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  textWhite: '#FFFFFF',

  // Colores de borde
  border: '#E0E0E0',
  borderLight: '#EEEEEE',

  // Gradientes
  gradientPrimary: ['#7C4DFF', '#651FFF'],
  gradientSecondary: ['#FF9800', '#F57C00'],
  gradientSuccess: ['#4CAF50', '#388E3C'],
  gradientGame: ['#6C63FF', '#7C4DFF'],

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.9)',
} as const;

// ============================
// TIPOGRAFÍA
// ============================

export const Typography = {
  // Tamaños de fuente
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Pesos de fuente
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Estilos predefinidos
  heading: {
    large: {
      fontSize: 30,
      fontWeight: '700' as const,
      color: Colors.text,
      lineHeight: 38,
    },
    medium: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: Colors.text,
      lineHeight: 32,
    },
    small: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: Colors.text,
      lineHeight: 24,
    },
  },

  body: {
    large: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: Colors.text,
      lineHeight: 24,
    },
    regular: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: Colors.text,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: Colors.textSecondary,
      lineHeight: 16,
    },
  },

  label: {
    large: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: Colors.text,
      lineHeight: 20,
    },
    regular: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: Colors.textSecondary,
      lineHeight: 16,
    },
  },
} as const;

// ============================
// ESPACIADOS
// ============================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ============================
// BORDER RADIUS
// ============================

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ============================
// SOMBRAS
// ============================

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================
// ICONOS
// ============================

export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

// ============================
// Z-INDEX
// ============================

export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================
// ESTILOS COMUNES
// ============================

export const CommonStyles = {
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  } as ViewStyle,

  // Botones
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  } as ViewStyle,

  // Textos
  textHeading: Typography.heading.large,
  textBody: Typography.body.regular,
  textLabel: Typography.label.regular,

  // Inputs
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  } as ViewStyle,
} as const;

// ============================
// THEME COMPLETO
// ============================

export const Theme = {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  IconSizes,
  ZIndex,
  CommonStyles,
} as const;

export type Theme = typeof Theme;
export default Theme;

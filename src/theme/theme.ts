/**
 * Sistema de Tema Centralizado - Pocket Quest
 * Paleta de colores moderna y tokens de diseño
 */

import { TextStyle, ViewStyle } from 'react-native';

// ============================
// PALETA DE COLORES
// ============================

export const Colors = {
  // Colores primarios - Azul vibrante moderno
  primary: '#5E72E4', // Azul vibrante
  primaryDark: '#485ac9',
  primaryLight: '#8A94FF',

  // Colores secundarios - Violeta moderno
  secondary: '#7C4DFF', // Violeta moderno
  secondaryDark: '#651FFF',
  secondaryLight: '#B388FF',

  // Colores de estado
  success: '#2DCE89', // Verde esmeralda moderno
  successDark: '#24b576',
  successLight: '#5CE2A8',

  warning: '#FB6340', // Naranja coral moderno
  warningDark: '#e04a28',
  warningLight: '#fc8970',

  danger: '#F5365C', // Rojo moderno
  dangerDark: '#d32549',
  dangerLight: '#f76b8a',

  info: '#11CDEF', // Cyan moderno
  infoDark: '#0da8c9',
  infoLight: '#4DDBF5',

  // Colores de fondo
  background: '#F4F5F7', // Gris muy suave
  backgroundDark: '#E8EAED',

  // Colores de superficie
  surface: '#FFFFFF',
  surfaceVariant: '#F7F9FC',

  // Colores de texto
  text: '#32325D', // Azul grisáceo oscuro
  textSecondary: '#8898AA',
  textLight: '#CED4DA',
  textWhite: '#FFFFFF',

  // Colores de borde
  border: '#E9ECEF',
  borderLight: '#F4F5F7',

  // Gradientes mejorados
  gradientPrimary: ['#5E72E4', '#825EE4'], // Azul a violeta
  gradientSecondary: ['#7C4DFF', '#B388FF'], // Violeta claro
  gradientSuccess: ['#2DCE89', '#2DCE89'], // Verde esmeralda
  gradientGame: ['#5E72E4', '#7C4DFF'], // Azul a violeta para juegos
  gradientWarm: ['#FB6340', '#F5365C'], // Naranja a rojo
  gradientCool: ['#11CDEF', '#5E72E4'], // Cyan a azul

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.95)',
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

  // Tamaño extra grande para countdowns y números grandes
  '5xl': {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.primary,
    lineHeight: 56,
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
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
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

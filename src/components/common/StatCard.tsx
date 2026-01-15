/**
 * Componente StatCard
 * Tarjeta para mostrar estadísticas (nivel, monedas, vidas)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, Spacing, Typography } from '../../theme';
import Icon from './Icon';

export type StatVariant = 'level' | 'coins' | 'lives' | 'experience' | 'custom';

export interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  variant?: StatVariant;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Obtiene el color de fondo según la variante
 */
const getGradientColors = (variant: StatVariant): [string, string] => {
  switch (variant) {
    case 'level':
      return [Colors.primary, Colors.primaryDark];
    case 'coins':
      return [Colors.secondary, Colors.secondaryDark];
    case 'lives':
      return [Colors.danger, Colors.dangerDark];
    case 'experience':
      return [Colors.success, Colors.successDark];
    default:
      return [Colors.primary, Colors.primaryDark];
  }
};

/**
 * Componente de tarjeta de estadística
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  variant = 'custom',
  style,
  size = 'medium',
}) => {
  const gradientColors = getGradientColors(variant);
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        isSmall && styles.cardSmall,
        isLarge && styles.cardLarge,
        style,
      ]}
    >
      <Icon
        name={icon}
        size={isSmall ? 'md' : isLarge ? 'xl' : 'lg'}
        color={Colors.textWhite}
        style={styles.icon}
      />
      <Text
        style={[
          styles.value,
          isSmall && styles.valueSmall,
          isLarge && styles.valueLarge,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardSmall: {
    minHeight: 80,
    padding: Spacing.sm,
  },
  cardLarge: {
    minHeight: 120,
    padding: Spacing.lg,
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.heading.medium,
    color: Colors.textWhite,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  valueSmall: {
    fontSize: 20,
    lineHeight: 26,
  },
  valueLarge: {
    fontSize: 32,
    lineHeight: 40,
  },
  label: {
    ...Typography.label.regular,
    color: Colors.textWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default StatCard;

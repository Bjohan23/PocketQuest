/**
 * Componente de Card Reutilizable
 * Contenedor con estilo de tarjeta y variantes
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, Spacing, Shadows, Typography } from '../theme';

export type CardVariant = 'elevated' | 'outlined' | 'gradient';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  shadow?: boolean;
  variant?: CardVariant;
  gradientColors?: [string, string];
}

/**
 * Componente de Card reutilizable con variantes
 */
const Card = ({
  children,
  title,
  style,
  onPress,
  padding = Spacing.md,
  shadow = true,
  variant = 'elevated',
  gradientColors,
}: CardProps): React.JSX.Element => {
  const cardContent = (
    <>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </>
  );

  // Obtener estilos según la variante
  const getCardStyles = () => {
    const baseStyle = {
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      padding,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
        };
      case 'gradient':
        return {
          ...baseStyle,
          overflow: 'hidden' as const,
        };
      case 'elevated':
      default:
        return {
          ...baseStyle,
          backgroundColor: Colors.surface,
          ...(shadow ? Shadows.md : {}),
        };
    }
  };

  const cardStyles = [getCardStyles(), style];

  if (variant === 'gradient') {
    const colors = gradientColors || Colors.gradientPrimary;
    const content = (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyles}
      >
        {cardContent}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.9}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  }

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{cardContent}</View>;
};

const styles = StyleSheet.create({
  title: {
    ...Typography.heading.small,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
});

export default Card;

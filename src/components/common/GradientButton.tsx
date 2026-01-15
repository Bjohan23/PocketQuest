/**
 * Componente GradientButton
 * Botón con gradiente, icono opcional y animación de press
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '../../theme';
import Icon, { IconProps } from './Icon';

// Configuración de Reanimated
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type GradientVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'game';

export interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: GradientVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: IconProps['name'];
  iconSize?: IconProps['size'];
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Obtiene los colores del gradiente según la variante
 */
const getGradientColors = (variant: GradientVariant): [string, string] => {
  switch (variant) {
    case 'primary':
      return [Colors.primary, Colors.primaryDark];
    case 'secondary':
      return [Colors.secondary, Colors.secondaryDark];
    case 'success':
      return [Colors.success, Colors.successDark];
    case 'danger':
      return [Colors.danger, Colors.dangerDark];
    case 'game':
      return Colors.gradientGame;
    default:
      return [Colors.primary, Colors.primaryDark];
  }
};

/**
 * Obtiene el padding según el tamaño
 */
const getPadding = (size: 'small' | 'medium' | 'large'): { vertical: number; horizontal: number } => {
  switch (size) {
    case 'small':
      return { vertical: Spacing.sm, horizontal: Spacing.md };
    case 'large':
      return { vertical: Spacing.lg, horizontal: Spacing.xl };
    case 'medium':
    default:
      return { vertical: Spacing.md, horizontal: Spacing.lg };
  }
};

/**
 * Componente de botón con gradiente y animación
 */
const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconSize = 'md',
  fullWidth = false,
  size = 'medium',
}) => {
  // Valores para animación
  const scale = useSharedValue(1);

  /**
   * Maneja el inicio del press
   */
  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  /**
   * Maneja el final del press
   */
  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gradientColors = getGradientColors(variant);
  const padding = getPadding(size);
  const fontSize = size === 'large' ? 18 : size === 'small' ? 14 : 16;

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.button,
        animatedStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            borderRadius: BorderRadius.lg,
            paddingVertical: padding.vertical,
            paddingHorizontal: padding.horizontal,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textWhite} size="small" />
        ) : (
          <>
            {icon && (
              <Icon
                name={icon}
                size={iconSize}
                color={Colors.textWhite}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.text,
                { fontSize },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
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
  buttonDisabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textWhite,
    fontWeight: '700',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

export default GradientButton;

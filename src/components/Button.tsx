/**
 * Componente de Botón Reutilizable
 * Botón personalizado con diferentes variantes, estilos, iconos y animaciones
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '../theme';
import Icon from './common/Icon';

// Configuración de Reanimated
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Obtiene los estilos según la variante del botón
 */
const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.primary,
        textColor: Colors.textWhite,
      };
    case 'secondary':
      return {
        backgroundColor: Colors.secondary,
        textColor: Colors.textWhite,
      };
    case 'success':
      return {
        backgroundColor: Colors.success,
        textColor: Colors.textWhite,
      };
    case 'danger':
      return {
        backgroundColor: Colors.danger,
        textColor: Colors.textWhite,
      };
    case 'warning':
      return {
        backgroundColor: Colors.warning,
        textColor: Colors.textWhite,
      };
    default:
      return {
        backgroundColor: Colors.primary,
        textColor: Colors.textWhite,
      };
  }
};

/**
 * Obtiene el padding según el tamaño
 */
const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        fontSize: 14,
      };
    case 'large':
      return {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        fontSize: 18,
      };
    case 'medium':
    default:
      return {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        fontSize: 16,
      };
  }
};

/**
 * Componente de botón reutilizable con iconos y animación
 */
const Button = ({
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
}: ButtonProps): React.JSX.Element => {
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

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.button,
        { backgroundColor: variantStyles.backgroundColor },
        fullWidth && styles.fullWidth,
        disabled && styles.buttonDisabled,
        { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} />
      ) : (
        <>
          {icon && (
            <Icon
              name={icon}
              size={iconSize}
              color={variantStyles.textColor}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: variantStyles.textColor, fontSize: sizeStyles.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: Colors.borderLight,
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;

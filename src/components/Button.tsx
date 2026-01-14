/**
 * Componente de Botón Reutilizable
 * Botón personalizado con diferentes variantes y estilos
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

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
  fullWidth?: boolean;
}

/**
 * Componente de botón reutilizable
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
  fullWidth = false,
}: ButtonProps): React.JSX.Element => {
  /**
   * Obtiene los estilos según la variante del botón
   */
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#4A90E2',
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: '#78909C',
          textColor: '#FFFFFF',
        };
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          textColor: '#FFFFFF',
        };
      case 'danger':
        return {
          backgroundColor: '#FF5252',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          textColor: '#FFFFFF',
        };
      default:
        return {
          backgroundColor: '#4A90E2',
          textColor: '#FFFFFF',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: variantStyles.backgroundColor },
        fullWidth && styles.fullWidth,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              { color: variantStyles.textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
});

export default Button;

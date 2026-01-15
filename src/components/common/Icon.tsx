/**
 * Componente Icon - Wrapper para react-native-vector-icons
 * Proporciona tamanos predefinidos y colores del tema
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, IconSizes } from '../../theme';

export interface IconProps {
  /**
   * Nombre del icono de Ionicons
   * Ver: https://ionic.io/ionicons
   */
  name: string;

  /**
   * Tamanos predefinidos del icono
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | number;

  /**
   * Color del icono (puede ser de Colors o un color custom)
   */
  color?: string;

  /**
   * Estilos adicionales para el contenedor
   */
  style?: ViewStyle;
}

/**
 * Componente de Icono reutilizable
 *
 * @example
 * <Icon name="home" size="md" color={Colors.primary} />
 * <Icon name="heart" size="lg" color={Colors.danger} />
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = Colors.text,
  style,
}) => {
  // Obtener tamaño numérico del icono
  const getSize = (): number => {
    if (typeof size === 'number') return size;
    return IconSizes[size] || IconSizes.md;
  };

  const iconSize = getSize();

  return (
    <Ionicons
      name={name as any}
      size={iconSize}
      color={color}
      style={[styles.icon, style]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    // El estilo base del icono, se puede personalizar con props
  },
});

export default Icon;

/**
 * Componente Accordion
 * Sección expandible con animación suave
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  measure,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import Icon from './Icon';

export interface AccordionProps {
  /**
   * Título del acordeón
   */
  title: string;

  /**
   * Icono a la izquierda (opcional)
   */
  icon?: string;

  /**
   * Contenido del acordeón
   */
  children: React.ReactNode;

  /**
   * Si está abierto inicialmente
   */
  initiallyOpen?: boolean;

  /**
   * Estilos adicionales del contenedor
   */
  style?: ViewStyle;

  /**
   * Estilos del contenedor interno
   */
  contentStyle?: ViewStyle;

  /**
   * Color del icono
   */
  iconColor?: string;
}

/**
 * Componente de acordeón animado
 */
const Accordion: React.FC<AccordionProps> = ({
  title,
  icon,
  children,
  initiallyOpen = false,
  style,
  contentStyle,
  iconColor = Colors.primary,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const animatedHeight = useSharedValue(initiallyOpen ? 1 : 0);
  const animatedRotation = useSharedValue(initiallyOpen ? 1 : 0);

  /**
   * Toggle del acordeón
   */
  const toggle = () => {
    setIsOpen(!isOpen);
    animatedHeight.value = withSpring(isOpen ? 0 : 1, {
      damping: 20,
      stiffness: 100,
    });
    animatedRotation.value = withSpring(isOpen ? 0 : 1, {
      damping: 20,
      stiffness: 100,
    });
  };

  // Estilo animado para la altura
  const heightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animatedHeight.value,
    transform: [{ scaleY: animatedHeight.value }],
  }));

  // Estilo animado para la rotación de la flecha
  const rotationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedRotation.value * 90}deg` }],
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.7}
      >
        {icon && (
          <Icon
            name={icon}
            size="lg"
            color={iconColor}
            style={styles.headerIcon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={rotationAnimatedStyle}>
          <Icon
            name="chevron-forward"
            size="md"
            color={Colors.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Contenido */}
      <Animated.View style={[styles.content, heightAnimatedStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
        <View style={[styles.contentInner, contentStyle]}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  headerIcon: {
    marginRight: Spacing.md,
  },
  title: {
    flex: 1,
    ...Typography.heading.small,
    color: Colors.text,
  },
  content: {
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  contentInner: {
    padding: Spacing.md,
    paddingTop: 0,
  },
});

export default Accordion;

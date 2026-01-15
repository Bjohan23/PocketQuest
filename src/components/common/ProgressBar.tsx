/**
 * Componente ProgressBar
 * Barra de progreso animada con colores personalizables
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../../theme';

export interface ProgressBarProps {
  /**
   * Progreso actual (0-100)
   */
  progress: number;

  /**
   * Color de la barra (puede ser un solo color o gradiente)
   */
  color?: string | [string, string];

  /**
   * Color de fondo de la barra
   */
  backgroundColor?: string;

  /**
   * Altura de la barra
   */
  height?: number;

  /**
   * Si es true, muestra el borde redondeado
   */
  rounded?: boolean;

  /**
   * Duración de la animación en ms
   */
  animationDuration?: number;

  /**
   * Estilos adicionales
   */
  style?: ViewStyle;

  /**
   * Si es true, anima el progreso
   */
  animated?: boolean;
}

/**
 * Componente de barra de progreso animada
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor = Colors.borderLight,
  height = 10,
  rounded = true,
  animationDuration = 500,
  style,
  animated = true,
}) => {
  // Valor de progreso animado
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 100) / 100, {
        duration: animationDuration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    } else {
      animatedProgress.value = Math.min(Math.max(progress, 0), 100) / 100;
    }
  }, [progress, animated, animationDuration]);

  // Estilo animado del width
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  // Determinar si usar gradiente o color sólido
  const useGradient = Array.isArray(color);
  const gradientColors = useGradient ? color : [color || Colors.primary, color || Colors.primaryDark];

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius: rounded ? height / 2 : 0,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.progressContainer, animatedStyle]}>
        {useGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              {
                borderRadius: rounded ? height / 2 : 0,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.solidColor,
              {
                backgroundColor: color || Colors.primary,
                borderRadius: rounded ? height / 2 : 0,
              },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progressContainer: {
    height: '100%',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  solidColor: {
    width: '100%',
    height: '100%',
  },
});

export default ProgressBar;

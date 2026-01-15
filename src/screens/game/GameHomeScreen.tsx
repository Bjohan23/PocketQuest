/**
 * Pantalla Principal del Modo Juego - Rediseño Moderno
 * UI de juego casual con estadísticas, animaciones y acciones
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Icon, StatCard, GradientButton, ProgressBar } from '../../components';

type NavigationProps = NativeStackNavigationProp<GameStackParamList, 'GameHome'>;

const GameHomeScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();

  // Estado del juego desde el store
  const { level, lives, coins, experience, addNotification } = useAppStore();

  // Valores para animaciones
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const statsScale = useSharedValue(0.8);
  const statsOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);

  // Animaciones de entrada al montar
  useEffect(() => {
    // Header animation
    headerOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Stats animation
    statsScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    statsOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });

    // Buttons animation
    buttonTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  // Estilos animados
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ scale: statsScale.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  /**
   * Navega a la pantalla de juego
   */
  const handlePlay = () => {
    addNotification({
      title: '¡A Jugar!',
      message: 'Iniciando partida...',
      type: 'game',
    });

    // Navegar al juego Whack-a-Mole
    navigation.navigate('WhackAMoleGame' as any);
  };

  /**
   * Navega a la tienda del juego
   */
  const handleShop = () => {
    addNotification({
      title: 'Tienda',
      message: 'Próximamente disponible',
      type: 'content',
    });
  };

  /**
   * Navega a la configuración del juego
   */
  const handleSettings = () => {
    navigation.navigate('GameSettings');
  };

  /**
   * Calcula el progreso del nivel actual
   */
  const getLevelProgress = (): number => {
    const experiencePerLevel = 100;
    return (experience % experiencePerLevel);
  };

  const currentLevelProgress = getLevelProgress();
  const maxProgress = 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header del Juego */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.avatarContainer}>
              <Icon name="person-circle" size="xl" color={Colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Pocket Quest</Text>
              <Text style={styles.subtitle}>Aventura Casual</Text>
            </View>
          </View>
        </Animated.View>

        {/* Panel de Estadísticas */}
        <Animated.View style={[statsAnimatedStyle, styles.statsSection]}>
          <View style={styles.statsRow}>
            <StatCard
              icon="star"
              value={level}
              label="Nivel"
              variant="level"
              size="medium"
              style={styles.statCard}
            />
            <StatCard
              icon="heart"
              value={lives}
              label="Vidas"
              variant="lives"
              size="medium"
              style={styles.statCard}
            />
            <StatCard
              icon="cash"
              value={coins}
              label="Monedas"
              variant="coins"
              size="medium"
              style={styles.statCard}
            />
          </View>

          {/* Barra de Experiencia */}
          <View style={styles.experienceContainer}>
            <View style={styles.experienceHeader}>
              <Text style={styles.experienceLabel}>Experiencia</Text>
              <Text style={styles.experienceValue}>{currentLevelProgress}/{maxProgress} XP</Text>
            </View>
            <ProgressBar
              progress={currentLevelProgress}
              color={Colors.gradientSuccess}
              height={12}
              animated
            />
          </View>
        </Animated.View>

        {/* Botones de Acción */}
        <Animated.View style={[buttonsAnimatedStyle, styles.actionsSection]}>
          <GradientButton
            title="JUGAR"
            onPress={handlePlay}
            variant="success"
            icon="play"
            iconSize="lg"
            fullWidth
            size="large"
            style={styles.actionButton}
          />

          <GradientButton
            title="TIENDA"
            onPress={handleShop}
            variant="secondary"
            icon="cart"
            iconSize="lg"
            fullWidth
            size="large"
            style={styles.actionButton}
          />

          <GradientButton
            title="CONFIGURACIÓN"
            onPress={handleSettings}
            variant="primary"
            icon="settings"
            iconSize="lg"
            fullWidth
            size="large"
            style={styles.actionButton}
          />
        </Animated.View>

        {/* Información Adicional */}
        <Animated.View style={[buttonsAnimatedStyle, styles.infoContainer]}>
          <Icon name="information-circle" size="md" color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            ¡Completa misiones para ganar experiencia y monedas!
          </Text>
          <Text style={styles.infoSubtext}>
            Nivel actual: {level}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    ...Typography.heading.large,
    color: Colors.primary,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body.regular,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsSection: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  experienceContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  experienceLabel: {
    ...Typography.label.large,
    color: Colors.text,
    fontWeight: '600',
  },
  experienceValue: {
    ...Typography.label.regular,
    color: Colors.textSecondary,
  },
  actionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  infoContainer: {
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoIcon: {
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...Typography.body.regular,
    color: Colors.infoDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  infoSubtext: {
    ...Typography.body.small,
    color: Colors.info,
    textAlign: 'center',
  },
});

export default GameHomeScreen;

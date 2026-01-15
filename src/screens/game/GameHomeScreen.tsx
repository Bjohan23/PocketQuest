/**
 * Pantalla Principal del Modo Juego - Rediseño Moderno
 * UI de juego casual con estadísticas, animaciones y acciones
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Icon, StatCard, GradientButton, ProgressBar } from '../../components';
import GameSelectorScreen from './GameSelectorScreen';

type NavigationProps = NativeStackNavigationProp<GameStackParamList, 'GameHome'>;

const GameHomeScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();

  // Estado del juego desde el store
  const { level, lives, coins, experience, addNotification } = useAppStore();

  // Valores para animaciones - Animated API nativa
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const statsScale = useRef(new Animated.Value(0.8)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(50)).current;

  // Estado para el modal de selección de juegos
  const [showGameSelector, setShowGameSelector] = useState(false);

  // Animaciones de entrada al montar
  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Stats animation
    Animated.parallel([
      Animated.timing(statsScale, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Buttons animation
    Animated.timing(buttonTranslateY, {
      toValue: 0,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Estilos animados
  const headerAnimatedStyle = {
    opacity: headerOpacity,
    transform: [{ translateY: headerTranslateY }],
  };

  const statsAnimatedStyle = {
    opacity: statsOpacity,
    transform: [{ scale: statsScale }],
  };

  const buttonsAnimatedStyle = {
    transform: [{ translateY: buttonTranslateY }],
  };

  /**
   * Navega a la pantalla de juego
   */
  const handlePlay = () => {
    // Mostrar selector de juegos
    setShowGameSelector(true);
  };

  /**
   * Navega a la tienda del juego
   */
  const handleShop = () => {
    navigation.navigate('GameShop');
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
              <Text style={styles.title}>Pocket Quest 3</Text>
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
            icon="game-controller"
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

      {/* Modal de selección de juegos */}
      <Modal
        visible={showGameSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGameSelector(false)}
      >
        <GameSelectorScreen closeModal={() => setShowGameSelector(false)} />
      </Modal>
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

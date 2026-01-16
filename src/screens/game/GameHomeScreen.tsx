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
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Icon, StatCard, GradientButton, ProgressBar } from '../../components';
import GameSelectorScreen from './GameSelectorScreen';

type NavigationProps = NativeStackNavigationProp<
  GameStackParamList,
  'GameHome'
>;

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
    return experience % experiencePerLevel;
  };

  const currentLevelProgress = getLevelProgress();
  const maxProgress = 100;

  return (
    <LinearGradient
      colors={['#4A148C', '#6A1B9A', '#7B1FA2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4A148C" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header del Juego */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View style={styles.avatarCircle}>
              <Icon name="person" size={32} color={Colors.surface} />
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Pocket Quest</Text>
              <Text style={styles.subtitle}>Aventura casual</Text>
            </View>
            <TouchableOpacity style={styles.notificationBadge}>
              <Icon name="notifications" size={24} color={Colors.surface} />
              <View style={styles.badgeDot} />
            </TouchableOpacity>
          </Animated.View>

          {/* Panel de Estadísticas */}
          <Animated.View style={[statsAnimatedStyle, styles.statsSection]}>
            <View style={styles.statsRow}>
              <View style={styles.statCardCustom}>
                <Icon name="flash" size={28} color="#FFB300" />
                <Text style={styles.statValue}>{level}</Text>
                <Text style={styles.statLabel}>Nivel</Text>
              </View>
              <View
                style={[styles.statCardCustom, { backgroundColor: '#C2185B' }]}
              >
                <Icon name="heart" size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{lives}</Text>
                <Text style={styles.statLabel}>Vidas</Text>
              </View>
              <View
                style={[styles.statCardCustom, { backgroundColor: '#D84315' }]}
              >
                <Icon name="logo-bitcoin" size={28} color="#FFD700" />
                <Text style={styles.statValue}>{coins.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Monedas</Text>
              </View>
            </View>

            {/* Barra de Experiencia */}
            <View style={styles.experienceContainer}>
              <View style={styles.experienceHeader}>
                <Text style={styles.experienceLabel}>Experiencia</Text>
                <Text style={styles.experienceValue}>
                  {currentLevelProgress} / {maxProgress} XP
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${(currentLevelProgress / maxProgress) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </Animated.View>

          {/* Botón Principal JUGAR */}
          <Animated.View
            style={[buttonsAnimatedStyle, styles.playButtonSection]}
          >
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlay}
              activeOpacity={0.9}
            >
              <Text style={styles.playButtonText}>JUGAR</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Botones Secundarios */}
          <Animated.View
            style={[buttonsAnimatedStyle, styles.secondaryButtons]}
          >
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleShop}
            >
              <Icon name="cart" size={24} color={Colors.surface} />
              <Text style={styles.secondaryButtonText}>Tienda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSettings}
            >
              <Icon name="settings" size={24} color={Colors.surface} />
              <Text style={styles.secondaryButtonText}>Configuración</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Notificaciones / Logros */}
          <Animated.View style={[buttonsAnimatedStyle, styles.achievements]}>
            <View style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Icon name="trophy" size={28} color="#FFB300" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>
                  ¡Nuevo logro desbloqueado!
                </Text>
                <Text style={styles.achievementDescription}>
                  Has completado 50 niveles. Sigue así.
                </Text>
              </View>
            </View>

            <View style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Icon name="gift" size={28} color="#00BCD4" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>
                  Recompensa diaria disponible
                </Text>
                <Text style={styles.achievementDescription}>
                  Inicia sesión mañana para obtener más monedas.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal de selección de juegos */}
      <Modal
        visible={showGameSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGameSelector(false)}
      >
        <GameSelectorScreen closeModal={() => setShowGameSelector(false)} />
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.surface,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  notificationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 2,
    borderColor: '#4A148C',
  },
  statsSection: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statCardCustom: {
    flex: 1,
    backgroundColor: '#5E35B1',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.surface,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  experienceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  experienceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  experienceValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#26C6DA',
    borderRadius: 5,
  },
  playButtonSection: {
    marginBottom: Spacing.lg,
  },
  playButton: {
    backgroundColor: '#26C6DA',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg + 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#26C6DA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: 1,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  achievements: {
    gap: Spacing.md,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.surface,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
});

export default GameHomeScreen;

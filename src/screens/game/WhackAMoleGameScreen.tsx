/**
 * Pantalla del Juego Whack-a-Mole
 * Juego completo con animaciones avanzadas, combos y dificultad progresiva
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import reactNativeHapticFeedback from 'react-native-haptic-feedback';
import { GameStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Icon, GradientButton } from '../../components';

type NavigationProps = NativeStackNavigationProp<GameStackParamList, 'WhackAMoleGame'>;

// Tipos de topo
type MoleType = 'normal' | 'golden' | 'bomb';
type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover';

interface Mole {
  id: number;
  type: MoleType;
  isVisible: boolean;
  wasHit: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 3;
const HOLE_SIZE = (SCREEN_WIDTH - Spacing.lg * 2) / GRID_SIZE - Spacing.sm;
const GAME_DURATION = 60; // segundos
const MOLE_BASE_DURATION = 1500; // ms que dura el topo visible
const MOLE_MIN_DURATION = 700; // ms mínimo que dura el topo

// Puntuaciones
const POINTS = {
  normal: 10,
  golden: 50,
  bomb: -20,
} as const;

const WhackAMoleGameScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const { addCoins, addExperience } = useAppStore();

  // Estado del juego
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [molesHit, setMolesHit] = useState(0);
  const [molesMissed, setMolesMissed] = useState(0);
  const [countdown, setCountdown] = useState(3);

  // Topos (9 agujeros)
  const [moles, setMoles] = useState<Mole[]>(
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      id: i,
      type: 'normal' as MoleType,
      isVisible: false,
      wasHit: false,
    }))
  );

  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Valores de animación
  const screenShake = useSharedValue(0);
  const comboScale = useSharedValue(1);

  /**
   * Iniciar el juego
   */
  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          setTimeLeft(GAME_DURATION);
          setScore(0);
          setCombo(0);
          setMaxCombo(0);
          setMolesHit(0);
          setMolesMissed(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Mostrar un topo aleatorio
   */
  const showMole = useCallback(() => {
    if (gameState !== 'playing') return;

    // Seleccionar un agujero aleatorio que esté vacío
    const availableHoles = moles.map((m, i) => ({ ...m, index: i }))
      .filter(m => !m.isVisible);

    if (availableHoles.length === 0) return;

    const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];

    // Determinar tipo de topo basado en dificultad
    let type: MoleType = 'normal';
    const random = Math.random();

    // Aumentar dificultad con el tiempo
    const difficultyMultiplier = (GAME_DURATION - timeLeft) / GAME_DURATION;

    if (random < 0.05 + difficultyMultiplier * 0.05) {
      type = 'bomb'; // 5-10% chance de bomba
    } else if (random < 0.15 + difficultyMultiplier * 0.1) {
      type = 'golden'; // 10-15% chance de topo dorado
    }

    // Mostrar el topo
    setMoles(prev => prev.map((mole, i) =>
      i === randomHole.index
        ? { ...mole, type, isVisible: true, wasHit: false }
        : mole
    ));

    // Ocultar el topo después de cierto tiempo
    const duration = Math.max(
      MOLE_MIN_DURATION,
      MOLE_BASE_DURATION - difficultyMultiplier * 500
    );

    setTimeout(() => {
      setMoles(prev => prev.map((mole, i) => {
        if (i === randomHole.index && mole.isVisible && !mole.wasHit) {
          // Topo se escapó sin ser golpeado
          if (mole.type === 'normal' || mole.type === 'golden') {
            setMolesMissed(prevMissed => prevMissed + 1);
            // Reset combo si se escapa un topo
            setCombo(0);
          }
          return { ...mole, isVisible: false };
        }
        return mole;
      }));
    }, duration);
  }, [gameState, moles, timeLeft]);

  /**
   * Manejar el toque en un topo
   */
  const handleMolePress = useCallback((moleIndex: number) => {
    if (gameState !== 'playing') return;

    const mole = moles[moleIndex];
    if (!mole.isVisible || mole.wasHit) return;

    // Haptic feedback
    reactNativeHapticFeedback.trigger('impactHeavy');

    // Marcar como golpeado
    setMoles(prev => prev.map((m, i) =>
      i === moleIndex ? { ...m, wasHit: true } : m
    ));

    // Ocultar el topo
    setTimeout(() => {
      setMoles(prev => prev.map((m, i) =>
        i === moleIndex ? { ...m, isVisible: false, wasHit: false } : m
      ));
    }, 200);

    // Calcular puntos
    let points = POINTS[mole.type];
    let newCombo = combo;

    if (mole.type === 'bomb') {
      // Bomba resetea combo y quita puntos
      newCombo = 0;
      // Screen shake
      screenShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } else {
      // Incrementar combo
      newCombo += 1;
      setMolesHit(prev => prev + 1);

      // Combo multiplier
      const comboMultiplier = Math.min(newCombo, 10);
      points = points * comboMultiplier;

      // Combo animation
      comboScale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
    }

    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));
    setScore(prev => Math.max(0, prev + points));

    // Reset combo timer
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000);
  }, [gameState, moles, combo, screenShake, comboScale]);

  /**
   * Pausar el juego
   */
  const pauseGame = useCallback(() => {
    setGameState('paused');
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moleTimerRef.current) clearInterval(moleTimerRef.current);
  }, []);

  /**
   * Reanudar el juego
   */
  const resumeGame = useCallback(() => {
    setGameState('playing');
  }, []);

  /**
   * Terminar el juego
   */
  const endGame = useCallback(() => {
    setGameState('gameover');

    // Actualizar high score
    setHighScore(prev => Math.max(prev, score));

    // Guardar progreso
    addCoins(Math.floor(score / 10));
    addExperience(Math.floor(score / 5));

    // Limpiar timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
  }, [score, addCoins, addExperience]);

  /**
   * Reiniciar el juego
   */
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  /**
   * Volver al menú
   */
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * Game loop - timers
   */
  useEffect(() => {
    if (gameState === 'playing') {
      // Timer del juego
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Timer de aparición de topos
      const moleInterval = Math.max(600, 1200 - ((GAME_DURATION - timeLeft) / GAME_DURATION) * 500);
      moleTimerRef.current = setInterval(() => {
        showMole();
      }, moleInterval);

      // Mostrar primer topo inmediatamente
      showMole();
    }

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    };
  }, [gameState, showMole, endGame, timeLeft]);

  // Estilo animado de screen shake
  const shakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: screenShake.value }],
  }));

  // Estilo animado de combo
  const comboAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: comboScale.value }],
  }));

  /**
   * Renderizar un topo
   */
  const renderMole = (mole: Mole, index: number) => {
    const getMoleIcon = () => {
      if (!mole.isVisible) return 'ellipse-outline';
      if (mole.type === 'golden') return 'trophy';
      if (mole.type === 'bomb') return 'flame';
      return 'pawprint';
    };

    const getMoleColor = () => {
      if (!mole.isVisible) return Colors.border;
      if (mole.type === 'golden') return Colors.warning;
      if (mole.type === 'bomb') return Colors.danger;
      return Colors.primary;
    };

    return (
      <TouchableOpacity
        key={mole.id}
        style={[
          styles.hole,
          { borderColor: getMoleColor() }
        ]}
        onPress={() => handleMolePress(index)}
        activeOpacity={0.8}
        disabled={!mole.isVisible}
      >
        <Animated.View style={[
          styles.mole,
          mole.isVisible && styles.moleVisible
        ]}>
          <Icon
            name={getMoleIcon()}
            size="xl"
            color={getMoleColor()}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  /**
   * Pantalla de menú
   */
  const renderMenu = () => (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <Icon name="game-controller" size="5xl" color={Colors.primary} style={styles.overlayIcon} />
        <Text style={styles.overlayTitle}>Whack-a-Mole</Text>
        <Text style={styles.overlaySubtitle}>
          ¡Golpea los topos para ganar puntos!
        </Text>
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            <Text style={styles.instructionIcon}>🐹</Text> Topo normal: +10 puntos
          </Text>
          <Text style={styles.instructionText}>
            <Text style={styles.instructionIcon}>🏆</Text> Topo dorado: +50 puntos
          </Text>
          <Text style={styles.instructionText}>
            <Text style={styles.instructionIcon}>💣</Text> Bomba: -20 puntos
          </Text>
          <Text style={styles.instructionText}>
            <Text style={styles.instructionIcon}>🔥</Text> Combo: multiplicador
          </Text>
        </View>
        <GradientButton
          title="JUGAR"
          onPress={startGame}
          variant="success"
          icon="play"
          iconSize="lg"
          fullWidth
          size="large"
          style={styles.overlayButton}
        />
      </View>
    </View>
  );

  /**
   * Pantalla de countdown
   */
  const renderCountdown = () => (
    <View style={styles.overlay}>
      <View style={styles.countdownContent}>
        <Animated.Text style={[styles.countdownText, comboAnimatedStyle]}>
          {countdown === 0 ? '¡YA!' : countdown}
        </Animated.Text>
      </View>
    </View>
  );

  /**
   * Pantalla de pausa
   */
  const renderPaused = () => (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <Icon name="pause-circle" size="5xl" color={Colors.primary} style={styles.overlayIcon} />
        <Text style={styles.overlayTitle}>Pausa</Text>
        <GradientButton
          title="CONTINUAR"
          onPress={resumeGame}
          variant="success"
          icon="play"
          fullWidth
          style={styles.overlayButton}
        />
        <GradientButton
          title="REINICIAR"
          onPress={restartGame}
          variant="secondary"
          icon="refresh"
          fullWidth
          style={styles.overlayButton}
        />
        <GradientButton
          title="SALIR"
          onPress={goBack}
          variant="danger"
          icon="close"
          fullWidth
          style={styles.overlayButton}
        />
      </View>
    </View>
  );

  /**
   * Pantalla de game over
   */
  const renderGameOver = () => (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <Icon name="trophy" size="5xl" color={Colors.warning} style={styles.overlayIcon} />
        <Text style={styles.overlayTitle}>¡Juego Terminado!</Text>
        <Text style={styles.scoreText}>Puntuación: {score}</Text>
        {score >= highScore && score > 0 && (
          <Text style={styles.highScoreText}>¡Nuevo Récord!</Text>
        )}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="pawprint" size="lg" color={Colors.primary} />
            <Text style={styles.statValue}>{molesHit}</Text>
            <Text style={styles.statLabel}>Golpeados</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up" size="lg" color={Colors.success} />
            <Text style={styles.statValue}>x{maxCombo}</Text>
            <Text style={styles.statLabel}>Max Combo</Text>
          </View>
        </View>
        <GradientButton
          title="JUGAR DE NUEVO"
          onPress={restartGame}
          variant="success"
          icon="refresh"
          fullWidth
          style={styles.overlayButton}
        />
        <GradientButton
          title="SALIR"
          onPress={goBack}
          variant="primary"
          icon="home"
          fullWidth
          style={styles.overlayButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, shakeAnimatedStyle]}>
        {/* Header del juego */}
        {gameState === 'playing' || gameState === 'paused' ? (
          <View style={styles.header}>
            <View style={styles.headerStats}>
              <View style={styles.headerStat}>
                <Icon name="star" size="sm" color={Colors.warning} />
                <Text style={styles.headerStatText}>{score}</Text>
              </View>
              <Animated.View style={comboAnimatedStyle}>
                <View style={styles.headerStat}>
                  <Icon name="flame" size="sm" color={Colors.danger} />
                  <Text style={styles.headerStatText}>x{combo}</Text>
                </View>
              </Animated.View>
            </View>

            <View style={styles.timerContainer}>
              <Text style={[
                styles.timerText,
                timeLeft <= 10 && styles.timerTextUrgent
              ]}>
                {Math.ceil(timeLeft)}s
              </Text>
            </View>

            <TouchableOpacity
              style={styles.pauseButton}
              onPress={pauseGame}
            >
              <Icon name="pause" size="lg" color={Colors.text} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Tablero de juego */}
        <View style={styles.board}>
          {moles.map((mole, index) => renderMole(mole, index))}
        </View>

        {/* Overlays */}
        {gameState === 'menu' && renderMenu()}
        {gameState === 'countdown' && renderCountdown()}
        {gameState === 'paused' && renderPaused()}
        {gameState === 'gameover' && renderGameOver()}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerStatText: {
    ...Typography.label.large,
    color: Colors.text,
    fontWeight: '700',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  timerText: {
    ...Typography.heading.medium,
    color: Colors.primary,
    fontWeight: '700',
  },
  timerTextUrgent: {
    color: Colors.danger,
  },
  pauseButton: {
    padding: Spacing.sm,
  },
  board: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  hole: {
    width: HOLE_SIZE,
    height: HOLE_SIZE,
    borderRadius: HOLE_SIZE / 2,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mole: {
    opacity: 0,
    transform: [{ scale: 0 }],
  },
  moleVisible: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  overlayIcon: {
    marginBottom: Spacing.lg,
  },
  overlayTitle: {
    ...Typography.heading.large,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  overlaySubtitle: {
    ...Typography.body.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  scoreText: {
    ...Typography.heading.medium,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  highScoreText: {
    ...Typography.label.large,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  instructions: {
    width: '100%',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  instructionText: {
    ...Typography.body.regular,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  instructionIcon: {
    fontSize: 20,
  },
  overlayButton: {
    marginBottom: Spacing.sm,
  },
  countdownContent: {
    alignItems: 'center',
  },
  countdownText: {
    ...Typography['5xl'],
    color: Colors.primary,
    fontWeight: '800',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.heading.small,
    color: Colors.text,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.body.small,
    color: Colors.textSecondary,
  },
});

export default WhackAMoleGameScreen;

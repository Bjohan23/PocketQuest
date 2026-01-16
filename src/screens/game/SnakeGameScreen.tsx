/**
 * Pantalla del Juego Snake
 * Versión moderna del clásico con controles táctiles y power-ups
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
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import reactNativeHapticFeedback from 'react-native-haptic-feedback';
import { GameStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../../theme';
import { Icon, GradientButton } from '../../components';

type NavigationProps = NativeStackNavigationProp<
  GameStackParamList,
  'SnakeGame'
>;

// Tipos de dirección
type Direction = 'up' | 'down' | 'left' | 'right';
type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover';

interface Position {
  x: number;
  y: number;
}

interface Food {
  position: Position;
  type: 'normal' | 'bonus' | 'speed';
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_SIZE = 20;
const CELL_SIZE = Math.floor(
  (Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) - Spacing.xl * 2) / GRID_SIZE,
);
const GAME_DURATION = 120; // segundos
const INITIAL_SPEED = 150; // ms entre movimientos
const MIN_SPEED = 80; // velocidad máxima

// Puntuaciones
const POINTS = {
  normal: 10,
  bonus: 30,
  speed: 20,
} as const;

const SnakeGameScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const { addCoins, addExperience } = useAppStore();

  // Estado del juego
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Food>({
    position: { x: 15, y: 10 },
    type: 'normal',
  });
  const [direction, setDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [countdown, setCountdown] = useState(3);
  const [foodsEaten, setFoodsEaten] = useState(0);

  // Refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Valores de animación
  const scaleValue = useRef(new Animated.Value(1)).current;

  /**
   * Generar posición aleatoria para comida
   */
  const generateFoodPosition = useCallback((): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);

    // Verificar que no esté en la serpiente
    const onSnake = snake.some(segment => segment.x === x && segment.y === y);
    if (onSnake) {
      return generateFoodPosition();
    }

    return { x, y };
  }, [snake]);

  /**
   * Generar tipo de comida basado en probabilidad
   */
  const generateFoodType = (): 'normal' | 'bonus' | 'speed' => {
    const random = Math.random();
    if (random < 0.1) return 'bonus'; // 10% chance
    if (random < 0.2) return 'speed'; // 10% chance
    return 'normal'; // 80% chance
  };

  /**
   * Iniciar el juego
   */
  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          setTimeLeft(GAME_DURATION);
          setScore(0);
          setSnake([{ x: 10, y: 10 }]);
          setDirection('right');
          setNextDirection('right');
          setSpeed(INITIAL_SPEED);
          setFoodsEaten(0);
          const newFood = generateFoodPosition();
          setFood({ position: newFood, type: 'normal' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [generateFoodPosition]);

  /**
   * Movimiento de la serpiente
   */
  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead: Position;

      switch (direction) {
        case 'up':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'down':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'left':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'right':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Verificar colisión con paredes
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        endGame();
        return prevSnake;
      }

      // Verificar colisión consigo misma
      if (
        prevSnake.some(
          segment => segment.x === newHead.x && segment.y === newHead.y,
        )
      ) {
        endGame();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Verificar si comió
      if (newHead.x === food.position.x && newHead.y === food.position.y) {
        // Haptic feedback
        reactNativeHapticFeedback.trigger('impactLight');

        // Añadir puntos
        const points = POINTS[food.type];
        setScore(prev => prev + points);
        setFoodsEaten(prev => prev + 1);

        // Animación de escala
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        // Generar nueva comida
        const newFoodPos = generateFoodPosition();
        setFood({ position: newFoodPos, type: generateFoodType() });

        // Aumentar velocidad gradualmente
        if (speed > MIN_SPEED) {
          setSpeed(prev => Math.max(MIN_SPEED, prev - 5));
        }

        return newSnake;
      } else {
        // Remover cola si no comió
        newSnake.pop();
        return newSnake;
      }
    });

    setDirection(nextDirection);
  }, [
    gameState,
    direction,
    nextDirection,
    food,
    speed,
    scaleValue,
    generateFoodPosition,
  ]);

  /**
   * Game loop
   */
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(moveSnake, speed);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, speed, moveSnake]);

  /**
   * Timer del juego
   */
  useEffect(() => {
    if (gameState === 'playing') {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [gameState]);

  /**
   * Cambiar dirección
   */
  const changeDirection = useCallback(
    (newDirection: Direction) => {
      // Evitar reverso inmediato
      const opposites: Record<Direction, Direction> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      };

      if (opposites[newDirection] !== direction) {
        setNextDirection(newDirection);
      }
    },
    [direction],
  );

  /**
   * Pausar el juego
   */
  const pauseGame = useCallback(() => {
    setGameState('paused');
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
    setHighScore(prev => Math.max(prev, score));
    addCoins(Math.floor(score / 10));
    addExperience(Math.floor(score / 5));
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

  // Estilo animado
  const scaleAnimatedStyle = {
    transform: [{ scale: scaleValue }],
  };

  /**
   * Renderizar la serpiente
   */
  const renderSnake = () => {
    return snake.map((segment, index) => {
      const isHead = index === 0;
      return (
        <Animated.View
          key={`${segment.x}-${segment.y}-${index}`}
          style={[
            styles.snakeSegment,
            {
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              backgroundColor: isHead ? Colors.primary : Colors.primaryLight,
            },
            isHead && scaleAnimatedStyle,
          ]}
        />
      );
    });
  };

  /**
   * Renderizar comida
   */
  const renderFood = () => {
    const getFoodIcon = () => {
      switch (food.type) {
        case 'bonus':
          return 'star';
        case 'speed':
          return 'flash';
        default:
          return 'ellipse';
      }
    };

    const getFoodColor = () => {
      switch (food.type) {
        case 'bonus':
          return Colors.warning;
        case 'speed':
          return Colors.info;
        default:
          return Colors.success;
      }
    };

    return (
      <Animated.View
        style={[
          styles.food,
          {
            left: food.position.x * CELL_SIZE,
            top: food.position.y * CELL_SIZE,
          },
        ]}
      >
        <Icon name={getFoodIcon() as any} size="sm" color={getFoodColor()} />
      </Animated.View>
    );
  };

  /**
   * Pantalla de menú
   */
  const renderMenu = () => (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <Icon
          name="game-controller"
          size="5xl"
          color={Colors.primary}
          style={styles.overlayIcon}
        />
        <Text style={styles.overlayTitle}>Snake</Text>
        <Text style={styles.overlaySubtitle}>
          ¡Come para crecer y evitar colisiones!
        </Text>
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Icon name="ellipse" size="md" color={Colors.success} />
            <Text style={styles.instructionText}>Normal: +10 puntos</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="star" size="md" color={Colors.warning} />
            <Text style={styles.instructionText}>Bonus: +30 puntos</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="flash" size="md" color={Colors.info} />
            <Text style={styles.instructionText}>Velocidad: +20 puntos</Text>
          </View>
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
        <Animated.Text style={[styles.countdownText, scaleAnimatedStyle]}>
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
        <Icon
          name="pause-circle"
          size="5xl"
          color={Colors.primary}
          style={styles.overlayIcon}
        />
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
        <Icon
          name="trophy"
          size="5xl"
          color={Colors.warning}
          style={styles.overlayIcon}
        />
        <Text style={styles.overlayTitle}>¡Juego Terminado!</Text>
        <Text style={styles.scoreText}>Puntuación: {score}</Text>
        {score >= highScore && score > 0 && (
          <Text style={styles.highScoreText}>¡Nuevo Récord!</Text>
        )}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="ellipse" size="lg" color={Colors.success} />
            <Text style={styles.statValue}>{foodsEaten}</Text>
            <Text style={styles.statLabel}>Comidas</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="time" size="lg" color={Colors.primary} />
            <Text style={styles.statValue}>
              {Math.floor((GAME_DURATION - timeLeft) / 60)}:
              {(GAME_DURATION - timeLeft) % 60 < 10 ? '0' : ''}
              {(GAME_DURATION - timeLeft) % 60}
            </Text>
            <Text style={styles.statLabel}>Tiempo</Text>
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
      {/* Header del juego */}
      {gameState === 'playing' || gameState === 'paused' ? (
        <View style={styles.header}>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Icon name="star" size="sm" color={Colors.warning} />
              <Text style={styles.headerStatText}>{score}</Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text
              style={[
                styles.timerText,
                timeLeft <= 30 && styles.timerTextUrgent,
              ]}
            >
              {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}
              {timeLeft % 60}
            </Text>
          </View>

          <TouchableOpacity style={styles.pauseButton} onPress={pauseGame}>
            <Icon name="pause" size="lg" color={Colors.text} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Tablero de juego */}
      <View style={styles.boardContainer}>
        <View style={styles.board}>
          {renderSnake()}
          {renderFood()}
        </View>
      </View>

      {/* Controles direccionales */}
      {gameState === 'playing' && (
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection('up')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-up" size="xl" color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection('left')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size="xl" color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.controlSpacer} />
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection('right')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-forward" size="xl" color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection('down')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-down" size="xl" color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Overlays */}
      {gameState === 'menu' && renderMenu()}
      {gameState === 'countdown' && renderCountdown()}
      {gameState === 'paused' && renderPaused()}
      {gameState === 'gameover' && renderGameOver()}
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
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  board: {
    width: CELL_SIZE * GRID_SIZE,
    height: CELL_SIZE * GRID_SIZE,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  snakeSegment: {
    position: 'absolute',
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    borderRadius: 4,
    margin: 1,
  },
  food: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  controlSpacer: {
    width: 60,
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
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  instructionText: {
    ...Typography.body.regular,
    color: Colors.text,
    flex: 1,
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

export default SnakeGameScreen;

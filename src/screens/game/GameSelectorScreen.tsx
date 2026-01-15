/**
 * Pantalla de Selección de Juegos
 * Permite elegir entre diferentes mini-juegos disponibles
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Icon, Card } from '../../components';

type NavigationProps = NativeStackNavigationProp<GameStackParamList, 'GameHome'>;

interface GameOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: keyof GameStackParamList;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  minPlayers: string;
  duration: string;
}

const GAMES: GameOption[] = [
  {
    id: 'whack-a-mole',
    name: 'Whack-a-Mole',
    description: '¡Golpea los topos tan rápido como puedas! Evita las bombas y atrapa los topos dorados para bonus.',
    icon: 'pawprint',
    color: Colors.primary,
    route: 'WhackAMoleGame',
    difficulty: 'Fácil',
    minPlayers: '1',
    duration: '60s',
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'El clásico juego de la serpiente. Come para crecer, evita chocar contra las paredes y contra ti mismo.',
    icon: 'game-controller',
    color: Colors.success,
    route: 'SnakeGame',
    difficulty: 'Medio',
    minPlayers: '1',
    duration: '2 min',
  },
];

const GameSelectorScreen = ({ closeModal }: { closeModal?: () => void }): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();

  // Valores de animación
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  // Animaciones de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Estilos animados
  const animatedStyle = {
    opacity,
    transform: [{ translateY }],
  };

  /**
   * Navegar al juego seleccionado
   */
  const handleGameSelect = (game: GameOption) => {
    if (closeModal) {
      closeModal();
    }
    navigation.navigate(game.route as any);
  };

  /**
   * Renderizar tarjeta de juego
   */
  const renderGameCard = (game: GameOption, index: number) => {
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslateY = useRef(new Animated.Value(50)).current;

    // Animación escalonada
    useEffect(() => {
      const delay = index * 100;
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cardTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
    }, [index]);

    const cardAnimatedStyle = {
      opacity: cardOpacity,
      transform: [{ translateY: cardTranslateY }],
    };

    return (
      <Animated.View key={game.id} style={cardAnimatedStyle}>
        <TouchableOpacity
          onPress={() => handleGameSelect(game)}
          activeOpacity={0.9}
        >
          <Card style={styles.gameCard} variant="elevated">
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: game.color + '20' }]}>
                <Icon name={game.icon as any} size="3xl" color={game.color} />
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{game.difficulty}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>

              <View style={styles.gameMeta}>
                <View style={styles.metaItem}>
                  <Icon name="time" size="xs" color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{game.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="person" size="xs" color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{game.minPlayers}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.playButton}>
                <Icon name="play" size="md" color={Colors.textWhite} />
                <Text style={styles.playButtonText}>JUGAR</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeModal}
        >
          <Icon name="close" size="xl" color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Selecciona un Juego</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedStyle}>
          <View style={styles.infoBanner}>
            <Icon name="information-circle" size="md" color={Colors.info} />
            <Text style={styles.infoText}>
              Elige un juego para comenzar. ¡Gana experiencia y monedas!
            </Text>
          </View>

          {GAMES.map((game, index) => renderGameCard(game, index))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.heading.medium,
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.body.regular,
    color: Colors.infoDark,
    flex: 1,
  },
  gameCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    ...Typography.body.small,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: Spacing.md,
  },
  gameName: {
    ...Typography.heading.small,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  gameDescription: {
    ...Typography.body.small,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  gameMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.body.small,
    color: Colors.textSecondary,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  playButtonText: {
    ...Typography.label.large,
    color: Colors.textWhite,
    fontWeight: '700',
  },
});

export default GameSelectorScreen;

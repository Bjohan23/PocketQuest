/**
 * Pantalla Principal del Modo Juego
 * UI de juego casual con estadísticas y acciones
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';

type NavigationProps = NativeStackNavigationProp<GameStackParamList, 'GameHome'>;

const GameHomeScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();

  // Estado del juego desde el store
  const { level, lives, coins, experience, addNotification } = useAppStore();

  /**
   * Navega a la pantalla de juego
   * Simula el inicio de una partida
   */
  const handlePlay = () => {
    // Simular notificación de juego
    addNotification({
      title: '¡A Jugar!',
      message: 'Partida iniciada',
      type: 'game',
    });

    // Aquí iría la lógica real del juego
    console.log('Iniciando partida...');
  };

  /**
   * Navega a la tienda del juego
   * Simula la apertura de la tienda
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
    return (experience % experiencePerLevel) / experiencePerLevel;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header del Juego */}
        <View style={styles.header}>
          <Text style={styles.title}>Pocket Quest</Text>
          <Text style={styles.subtitle}>Aventura Casual</Text>
        </View>

        {/* Panel de Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Nivel</Text>
              <Text style={styles.statValue}>{level}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vidas</Text>
              <View style={styles.livesContainer}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.heart,
                      { opacity: index < lives ? 1 : 0.3 }]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Monedas</Text>
              <Text style={styles.statValue}>{coins}</Text>
            </View>
          </View>

          {/* Barra de Experiencia */}
          <View style={styles.experienceContainer}>
            <Text style={styles.experienceText}>Experiencia</Text>
            <View style={styles.experienceBar}>
              <View style={[styles.experienceFill, { width: `${getLevelProgress() * 100}%` }]} />
            </View>
            <Text style={styles.experienceValue}>{experience % 100}/100 XP</Text>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlay}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>JUGAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shopButton]}
            onPress={handleShop}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>TIENDA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.settingsButton]}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>CONFIGURACIÓN</Text>
          </TouchableOpacity>
        </View>

        {/* Información Adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ¡Completa misiones para ganar experiencia y monedas!
          </Text>
          <Text style={styles.infoSubtext}>
            Nivel actual: {level}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  livesContainer: {
    flexDirection: 'row',
  },
  heart: {
    width: 20,
    height: 20,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    marginHorizontal: 2,
  },
  experienceContainer: {
    marginTop: 10,
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  experienceBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  experienceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  experienceValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  actionsContainer: {
    gap: 15,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  shopButton: {
    backgroundColor: '#FF9800',
  },
  settingsButton: {
    backgroundColor: '#4A90E2',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default GameHomeScreen;

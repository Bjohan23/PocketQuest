/**
 * Navegación Raíz de Pocket Quest
 * Gestiona los dos modos de la aplicación y el acceso
 */

import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types';

// Importar navegaciones modulares
import GameNavigation from './GameNavigation';
import CommunicationNavigation from './CommunicationNavigation';

// Importar pantalla de acceso
import AccessScreen from '../screens/access/AccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Componente de navegación raíz
 * Controla qué modo está activo basándose en el estado global
 */
const RootNavigation = (): React.JSX.Element => {
  const { currentMode, isAuthenticated, canAccessCommunication } = useAppStore();

  /**
   * Efecto para simular notificaciones del juego
   * Se ejecuta periódicamente para mostrar notificaciones genéricas
   */
  useEffect(() => {
    if (currentMode === 'game') {
      const notificationInterval = setInterval(() => {
        const { addNotification } = useAppStore.getState();
        const notifications = [
          {
            title: 'Nuevo Desafío',
            message: '¡Un nuevo desafío está disponible!',
            type: 'challenge' as const,
          },
          {
            title: 'Recompensas',
            message: 'Tienes recompensas pendientes',
            type: 'reward' as const,
          },
          {
            title: 'Contenido',
            message: 'Contenido nuevo desbloqueado',
            type: 'content' as const,
          },
        ];

        const randomNotification =
          notifications[Math.floor(Math.random() * notifications.length)];
        addNotification(randomNotification);
      }, 30000); // Cada 30 segundos

      return () => clearInterval(notificationInterval);
    }
    return undefined;
  }, [currentMode]);

  return (
    <Stack.Navigator
      initialRouteName="GameStack"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Modo Juego - Siempre accesible */}
      <Stack.Screen name="GameStack" component={GameNavigation} />

      {/* Pantalla de Acceso - Puente entre modos */}
      <Stack.Screen name="Access" component={AccessScreen} />

      {/* Modo Comunicación - Requiere autenticación */}
      {isAuthenticated && canAccessCommunication && (
        <Stack.Screen name="CommunicationStack" component={CommunicationNavigation} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;

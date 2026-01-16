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
  const {
    currentMode,
    isAuthenticated,
    canAccessCommunication,
    checkAuthStatus,
  } = useAppStore();

  // Verificar estado de autenticación al iniciar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Efecto para simular notificaciones del juego
   * Se ejecuta periódicamente para mostrar notificaciones genéricas
   */
  useEffect(() => {
    if (currentMode === 'game' && !isAuthenticated) {
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
  }, [currentMode, isAuthenticated]);

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'CommunicationStack' : 'GameStack'}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Si está autenticado, mostrar solo Comunicación */}
      {isAuthenticated && canAccessCommunication ? (
        <Stack.Screen
          name="CommunicationStack"
          component={CommunicationNavigation}
        />
      ) : (
        <>
          {/* Si NO está autenticado, mostrar solo Juego */}
          <Stack.Screen name="GameStack" component={GameNavigation} />
          <Stack.Screen name="Access" component={AccessScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;

/**
 * Hook personalizado para navegación y cambio de contexto
 * Facilita la transición entre modos de la aplicación
 */

import { useRef } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook para manejar navegación y cambio de contexto
 * Proporciona métodos para navegar y cambiar entre modos
 */
export const useAppNavigation = () => {
  const navigationRef = useRef<NavigationProp<RootStackParamList>>(null);

  const {
    currentMode,
    isAuthenticated,
    canAccessCommunication,
    switchToGameMode,
    switchToCommunicationMode,
    enableCommunicationAccess,
    resetCommunication,
  } = useAppStore();

  /**
   * Cambia al modo de comunicación
   * Si no está autenticado, va a la pantalla de acceso
   */
  const goToCommunicationMode = () => {
    if (!isAuthenticated || !canAccessCommunication) {
      // Ir a pantalla de acceso
      navigationRef.current?.navigate('Access' as never);
    } else {
      // Cambiar a modo comunicación y navegar
      switchToCommunicationMode();
      navigationRef.current?.navigate('CommunicationStack' as never);
    }
  };

  /**
   * Cambia al modo de juego
   * Resetea el estado de comunicación y evita navegación atrás
   */
  const goToGameMode = () => {
    // Resetear estado de comunicación
    if (currentMode === 'communication') {
      resetCommunication();
    }

    // Cambiar a modo juego
    switchToGameMode();

    // Navegar al stack de juego
    navigationRef.current?.navigate('GameStack' as never);

    // Resetear el stack de navegación para evitar volver atrás
    if (navigationRef.current && 'resetRoot' in navigationRef.current) {
      (navigationRef.current as any).resetRoot({
        index: 0,
        routes: [{ name: 'GameStack' }],
      });
    }
  };

  /**
   * Habilita el acceso al modo comunicación
   * Se llama desde GameSettings con el código correcto
   */
  const enableCommunication = () => {
    enableCommunicationAccess();
  };

  /**
   * Realiza logout y vuelve al modo juego
   */
  const logout = () => {
    const { logout: logoutAction } = useAppStore.getState();
    logoutAction();
    goToGameMode();
  };

  return {
    navigationRef,
    currentMode,
    isAuthenticated,
    canAccessCommunication,
    goToCommunicationMode,
    goToGameMode,
    enableCommunication,
    logout,
  };
};

export default useAppNavigation;

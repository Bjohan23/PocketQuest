/**
 * Pocket Quest - Aplicación Móvil Educativa
 * Arquitectura modular con separación de contextos
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigation from './src/navigation/RootNavigation';
import { useAppStore } from './src/store/useAppStore';
import { notificationService } from './src/services/notificationService';

/**
 * Componente principal de la aplicación
 */
function App(): React.JSX.Element {
  const addNotification = useAppStore((state) => state.addNotification);

  // Inicializar notificaciones simuladas al inicio
  React.useEffect(() => {
    // Agregar notificación de bienvenida
    const welcomeNotification = notificationService.createNotification(
      'Bienvenido a Pocket Quest',
      '¡Tu aventura está a punto de comenzar!',
      'game',
    );

    addNotification(welcomeNotification);
  }, [addNotification]);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A90E2"
      />

      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

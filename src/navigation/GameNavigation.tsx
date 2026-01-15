/**
 * Navegación del Modo Juego
 * Stack Navigator para las pantallas del juego
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GameStackParamList } from '../types';

// Importar pantallas del juego
import GameHomeScreen from '../screens/game/GameHomeScreen';
import GameSettingsScreen from '../screens/game/GameSettingsScreen';
import WhackAMoleGameScreen from '../screens/game/WhackAMoleGameScreen';

const Stack = createNativeStackNavigator<GameStackParamList>();

const GameNavigation = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName="GameHome"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="GameHome"
        component={GameHomeScreen}
        options={{
          title: 'Pocket Quest',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="GameSettings"
        component={GameSettingsScreen}
        options={{
          title: 'Configuración',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="WhackAMoleGame"
        component={WhackAMoleGameScreen}
        options={{
          title: 'Whack-a-Mole',
          headerShown: false,
          orientation: 'landscape',
        }}
      />
    </Stack.Navigator>
  );
};

export default GameNavigation;

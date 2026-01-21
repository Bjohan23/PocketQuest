/**
 * Navegación del Modo Comunicación
 * Stack Navigator para las pantallas de comunicación
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunicationStackParamList } from '../types';

// Importar pantallas de comunicación
import ConversationListScreen from '../screens/communication/ConversationListScreen';
import ConversationScreen from '../screens/communication/ConversationScreen';
import ConversationSettingsScreen from '../screens/communication/ConversationSettingsScreen';

const Stack = createNativeStackNavigator<CommunicationStackParamList>();

const CommunicationNavigation = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName="ConversationList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E293B', // Color oscuro consistente con el diseño
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="ConversationList"
        component={ConversationListScreen}
        options={{
          title: 'Mensajes',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          title: 'Conversación',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="ConversationSettings"
        component={ConversationSettingsScreen}
        options={{
          title: 'Configuración',
          headerBackTitle: 'Atrás',
        }}
      />
    </Stack.Navigator>
  );
};

export default CommunicationNavigation;

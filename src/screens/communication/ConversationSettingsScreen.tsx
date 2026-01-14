/**
 * Pantalla de Configuración de Conversación
 * Configuración de mensajes temporales y opciones de conversación
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CommunicationStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';

type RouteProps = RouteProp<CommunicationStackParamList, 'ConversationSettings'>;

/**
 * Opciones de duración para mensajes temporales
 */
const TEMPORARY_DURATION_OPTIONS = [
  { label: '30 segundos', value: 30 },
  { label: '1 minuto', value: 60 },
  { label: '5 minutos', value: 300 },
  { label: '10 minutos', value: 600 },
];

/**
 * Pantalla de configuración de conversación
 */
const ConversationSettingsScreen = (): React.JSX.Element => {
  const route = useRoute<RouteProps>();
  const { conversationId } = route.params;

  // Estado del store
  const {
    conversations,
    temporaryMessagesEnabled,
    temporaryDuration,
    updateConversationSettings,
    clearConversation,
  } = useAppStore();

  // Encontrar la conversación actual
  const activeConversation = conversations.find((c) => c.id === conversationId);

  /**
   * Cambia el estado de mensajes temporales
   */
  const handleToggleTemporaryMessages = () => {
    updateConversationSettings(!temporaryMessagesEnabled, temporaryDuration);
    Alert.alert(
      'Mensajes Temporales',
      temporaryMessagesEnabled
        ? 'Los mensajes ya no serán temporales'
        : 'Los mensajes desaparecerán después del tiempo especificado',
    );
  };

  /**
   * Cambia la duración de los mensajes temporales
   */
  const handleDurationChange = (duration: number) => {
    updateConversationSettings(temporaryMessagesEnabled, duration);
    Alert.alert(
      'Duración Actualizada',
      `Los mensajes temporales durarán ${
        TEMPORARY_DURATION_OPTIONS.find((opt) => opt.value === duration)?.label
      }`,
    );
  };

  /**
   * Limpia la conversación (elimina todos los mensajes)
   */
  const handleClearConversation = () => {
    Alert.alert(
      'Limpiar Conversación',
      '¿Estás seguro de que deseas eliminar todos los mensajes de esta conversación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            clearConversation(conversationId);
            Alert.alert('Conversación Limpiada', 'Todos los mensajes han sido eliminados');
          },
        },
      ],
    );
  };

  if (!activeConversation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Conversación no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Información de la Conversación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{activeConversation.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text
              style={[
                styles.infoValue,
                { color: activeConversation.onlineStatus === 'online' ? '#4CAF50' : '#999' },
              ]}
            >
              {activeConversation.onlineStatus === 'online' ? 'En línea' : 'Desconectado'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mensajes:</Text>
            <Text style={styles.infoValue}>{activeConversation.messages.length}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>No leídos:</Text>
            <Text style={styles.infoValue}>{activeConversation.unreadCount}</Text>
          </View>
        </View>

        {/* Configuración de Mensajes Temporales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mensajes Temporales</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Mensajes temporales</Text>
              <Text style={styles.settingDescription}>
                Los mensajes se eliminarán automáticamente después de ser leídos
              </Text>
            </View>
            <Switch
              value={temporaryMessagesEnabled}
              onValueChange={handleToggleTemporaryMessages}
              trackColor={{ false: '#767577', true: '#2E7D32' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {temporaryMessagesEnabled && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationTitle}>Duración de mensajes:</Text>

              {TEMPORARY_DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.durationOption,
                    temporaryDuration === option.value && styles.durationOptionActive,
                  ]}
                  onPress={() => handleDurationChange(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      temporaryDuration === option.value && styles.durationOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {temporaryDuration === option.value && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Opciones de Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notificaciones</Text>
              <Text style={styles.settingDescription}>
                Recibir alertas de nuevos mensajes
              </Text>
            </View>
            <Switch
              value={true} // Simulado
              onValueChange={() => {}}
              trackColor={{ false: '#767577', true: '#2E7D32' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sonido</Text>
              <Text style={styles.settingDescription}>
                Reproducir sonido al recibir mensajes
              </Text>
            </View>
            <Switch
              value={true} // Simulado
              onValueChange={() => {}}
              trackColor={{ false: '#767577', true: '#2E7D32' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Opciones de Gestión */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearConversation}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>🗑️ Limpiar Conversación</Text>
          </TouchableOpacity>
        </View>

        {/* Información de Privacidad */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyTitle}>🔒 Privacidad</Text>
          <Text style={styles.privacyText}>
            Tus mensajes son privados y seguros. Los mensajes temporales se eliminan
            permanentemente después del tiempo especificado.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  durationContainer: {
    marginTop: 15,
  },
  durationTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  durationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  durationOptionActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  durationOptionText: {
    fontSize: 14,
    color: '#333',
  },
  durationOptionTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  checkIcon: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 15,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ConversationSettingsScreen;

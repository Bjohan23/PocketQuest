/**
 * Pantalla de Configuración del Modo Juego
 * Preferencias del juego y acceso al modo comunicación
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { APP_CONFIG } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const GameSettingsScreen = (): React.JSX.Element => {

  // Estado del juego desde el store
  const { soundEnabled, language, updateSettings, enableCommunicationAccess } = useAppStore();

  // Estado local para el acceso avanzado
  const [accessCode, setAccessCode] = useState('');
  const [showAdvancedAccess, setShowAdvancedAccess] = useState(false);

  /**
   * Maneja el cambio de idioma
   */
  const handleLanguageChange = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    updateSettings({ language: newLanguage });
    Alert.alert('Idioma cambiado', `Idioma establecido a ${newLanguage === 'es' ? 'Español' : 'Inglés'}`);
  };

  /**
   * Maneja el cambio de sonido
   */
  const handleSoundToggle = () => {
    updateSettings({ soundEnabled: !soundEnabled });
  };

  /**
   * Valida e intenta habilitar el acceso al modo comunicación
   */
  const handleAdvancedAccess = () => {
    if (!accessCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de acceso');
      return;
    }

    // Validar el código de acceso
    const isValidCode =
      accessCode === APP_CONFIG.DEFAULT_ACCESS_CODE ||
      accessCode === APP_CONFIG.ADVANCED_ACCESS_CODE;

    if (isValidCode) {
      enableCommunicationAccess();
      Alert.alert(
        '¡Acceso Habilitado!',
        'Ahora puedes acceder al modo comunicación desde la configuración.',
        [
          {
            text: 'OK',
            onPress: () => {
              setAccessCode('');
              setShowAdvancedAccess(false);
            },
          },
        ],
      );
    } else {
      Alert.alert('Código Inválido', 'El código ingresado no es correcto');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sección de Preferencias de Sonido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias de Sonido</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sonido habilitado</Text>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: '#767577', true: '#4A90E2' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Sección de Idioma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idioma</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              Idioma actual: {language === 'es' ? 'Español' : 'Inglés'}
            </Text>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={handleLanguageChange}
            >
              <Text style={styles.languageButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección de Acceso Avanzado */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.advancedHeader}
            onPress={() => setShowAdvancedAccess(!showAdvancedAccess)}
          >
            <Text style={styles.sectionTitle}>Acceso Avanzado</Text>
            <Text style={styles.advancedArrow}>{showAdvancedAccess ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showAdvancedAccess && (
            <View style={styles.advancedContent}>
              <Text style={styles.advancedDescription}>
                Ingresa un código de acceso para habilitar funcionalidades adicionales
              </Text>

              <TextInput
                style={styles.accessInput}
                placeholder="Código de acceso"
                value={accessCode}
                onChangeText={setAccessCode}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="off"
              />

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleAdvancedAccess}
              >
                <Text style={styles.continueButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Información de la Aplicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versión:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modo:</Text>
            <Text style={styles.infoValue}>Juego</Text>
          </View>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  languageButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advancedArrow: {
    fontSize: 16,
    color: '#666',
  },
  advancedContent: {
    marginTop: 15,
  },
  advancedDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  accessInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default GameSettingsScreen;

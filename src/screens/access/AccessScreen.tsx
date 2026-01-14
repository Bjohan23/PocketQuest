/**
 * Pantalla de Acceso al Modo Comunicación
 * Puente entre el modo juego y el modo comunicación
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import useAppNavigation from '../../hooks/useNavigation';

type NavigationProps = NavigationProp<RootStackParamList>;

const AccessScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const { login, switchToCommunicationMode, canAccessCommunication } = useAppStore();
  const { goToGameMode } = useAppNavigation();

  // Estado local para el código de acceso
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Maneja el proceso de login
   * Valida el código y navega al modo comunicación si es correcto
   */
  const handleLogin = async () => {
    if (!accessCode.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa el código de acceso');
      return;
    }

    setIsLoading(true);

    try {
      // Simular delay de red
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      // Intentar login con el código
      const success = await login(accessCode);

      if (success) {
        // Cambiar al modo comunicación
        switchToCommunicationMode();

        // Navegar al modo comunicación
        (navigation as any).navigate('CommunicationStack');

        Alert.alert('Bienvenido', 'Acceso concedido al modo comunicación');
      } else {
        Alert.alert(
          'Código Incorrecto',
          'El código de acceso ingresado no es válido',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar acceder');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Vuelve al modo juego
   * Implementa el mecanismo de cambio rápido de contexto
   */
  const handleBackToGame = () => {
    setAccessCode('');
    goToGameMode();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo o Icono */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🔐</Text>
          </View>
        </View>

        {/* Título y Descripción */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Acceso Restringido</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de acceso para continuar al modo comunicación
          </Text>
        </View>

        {/* Campo de Código de Acceso */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Código de Acceso</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={accessCode}
            onChangeText={setAccessCode}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="off"
            autoFocus
            editable={!isLoading}
            onSubmitEditing={handleLogin}
          />

          {/* Botón de Ingresar */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón para Volver al Juego */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToGame}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Volver al Juego</Text>
        </TouchableOpacity>

        {/* Información de Ayuda */}
        {!canAccessCommunication && (
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              💡 Primero debes habilitar el acceso desde la configuración del juego
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    letterSpacing: 4,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    padding: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  helpContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AccessScreen;

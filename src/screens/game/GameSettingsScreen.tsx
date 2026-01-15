/**
 * Pantalla de Configuración del Modo Juego - Rediseño Moderno
 * Preferencias del juego con iconos, acordeones y animaciones
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { APP_CONFIG } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Icon, SettingRow, Accordion, GradientButton, Card } from '../../components';

const GameSettingsScreen = (): React.JSX.Element => {
  // Estado del juego desde el store
  const { soundEnabled, language, updateSettings, enableCommunicationAccess } = useAppStore();

  // Estado local para el acceso avanzado
  const [accessCode, setAccessCode] = useState('');
  const [showAdvancedAccess, setShowAdvancedAccess] = useState(false);

  // Valores para animaciones
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Animación de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Estilo animado
  const animatedStyle = {
    opacity,
    transform: [{ translateY }],
  };

  /**
   * Maneja el cambio de idioma
   */
  const handleLanguageChange = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    updateSettings({ language: newLanguage });
    Alert.alert(
      'Idioma cambiado',
      `Idioma establecido a ${newLanguage === 'es' ? 'Español' : 'Inglés'}`,
      [{ text: 'OK', style: 'default' }]
    );
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
        ]
      );
    } else {
      Alert.alert('Código Inválido', 'El código ingresado no es correcto');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={animatedStyle}>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="settings" size="xl" color={Colors.primary} />
            <Text style={styles.headerTitle}>Configuración</Text>
          </View>

          {/* Sección de Preferencias de Sonido */}
          <Card style={styles.section} variant="elevated">
            <SettingRow
              icon="volume-high"
              label="Sonido habilitado"
              description="Activar o desactivar efectos de sonido"
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              iconColor={Colors.primary}
            />
          </Card>

          {/* Sección de Idioma */}
          <Card style={styles.section} variant="elevated">
            <SettingRow
              icon="globe"
              label="Idioma"
              description={`Idioma actual: ${language === 'es' ? 'Español' : 'Inglés'}`}
              onPress={handleLanguageChange}
              iconColor={Colors.secondary}
            />
          </Card>

          {/* Sección de Acceso Avanzado */}
          <Accordion
            title="Acceso Avanzado"
            icon="lock-closed"
            initiallyOpen={false}
            iconColor={Colors.warning}
            style={styles.section}
          >
            <Text style={styles.advancedDescription}>
              Ingresa un código de acceso para habilitar funcionalidades adicionales del modo comunicación.
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="key" size="md" color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.accessInput}
                placeholder="Código de acceso"
                placeholderTextColor={Colors.textLight}
                value={accessCode}
                onChangeText={setAccessCode}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="off"
              />
            </View>

            <GradientButton
              title="Continuar"
              onPress={handleAdvancedAccess}
              variant="primary"
              icon="arrow-forward"
              fullWidth
              style={styles.continueButton}
            />
          </Accordion>

          {/* Sección de Información */}
          <Card style={styles.section} variant="elevated">
            <SettingRow
              icon="information-circle"
              label="Versión"
              description="1.0.0"
              iconColor={Colors.info}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="game-controller"
              label="Modo"
              description="Juego"
              iconColor={Colors.success}
            />
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pocket Quest v1.0.0</Text>
            <Text style={styles.footerSubtext}>Modo Juego Activo</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading.large,
    color: Colors.text,
    fontWeight: '700',
    marginLeft: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  advancedDescription: {
    ...Typography.body.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  accessInput: {
    flex: 1,
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    color: Colors.text,
    fontSize: Typography.fontSize.base,
  },
  continueButton: {
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  footerText: {
    ...Typography.label.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    ...Typography.body.small,
    color: Colors.textLight,
  },
});

export default GameSettingsScreen;

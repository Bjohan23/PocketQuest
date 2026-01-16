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
  TouchableOpacity,
  Switch,
} from 'react-native';
import { APP_CONFIG } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { Icon, Accordion, GradientButton, Card } from '../../components';

const GameSettingsScreen = (): React.JSX.Element => {
  // Estado del juego desde el store
  const { soundEnabled, language, updateSettings, loginWithCode } =
    useAppStore();

  // Estado local para el código promocional
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      [{ text: 'OK', style: 'default' }],
    );
  };

  /**
   * Maneja el cambio de sonido
   */
  const handleSoundToggle = () => {
    updateSettings({ soundEnabled: !soundEnabled });
  };

  /**
   * Valida el código promocional (acceso secreto)
   */
  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Código inválido', 'Por favor ingresa un código promocional');
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginWithCode(promoCode);

      if (success) {
        Alert.alert(
          '¡Promoción Activada!',
          'Has desbloqueado beneficios especiales',
          [
            {
              text: 'OK',
              onPress: () => {
                setPromoCode('');
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Código inválido',
          'El código promocional ingresado no es válido o ha expirado',
        );
      }
    } catch (error) {
      Alert.alert(
        'Código inválido',
        'El código promocional ingresado no es válido o ha expirado',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedStyle}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Configuración</Text>
          </View>

          {/* Sección Principal */}
          <Card style={styles.settingsCard} variant="elevated">
            {/* Perfil */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View
                style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}
              >
                <Icon name="person" size="lg" color="#9C27B0" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Perfil</Text>
                <Text style={styles.settingDescription}>
                  Editar información personal
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size="md"
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Notificaciones */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View
                style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}
              >
                <Icon name="notifications" size="lg" color="#4CAF50" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notificaciones</Text>
                <Text style={styles.settingDescription}>Gestionar alertas</Text>
              </View>
              <Icon
                name="chevron-forward"
                size="md"
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Apariencia / Idioma */}
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={handleLanguageChange}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}
              >
                <Icon name="color-palette" size="lg" color="#FF9800" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Apariencia</Text>
                <Text style={styles.settingDescription}>
                  {language === 'es' ? 'Español' : 'English'}
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size="md"
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Privacidad / Sonido */}
            <View style={styles.settingItem}>
              <View
                style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}
              >
                <Icon
                  name={soundEnabled ? 'volume-high' : 'volume-mute'}
                  size="lg"
                  color="#2196F3"
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Sonido</Text>
                <Text style={styles.settingDescription}>
                  {soundEnabled ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{
                  false: Colors.borderLight,
                  true: Colors.primaryLight,
                }}
                thumbColor={soundEnabled ? Colors.primary : Colors.surface}
                ios_backgroundColor={Colors.borderLight}
              />
            </View>

            <View style={styles.divider} />

            {/* Ayuda */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View
                style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}
              >
                <Icon name="help-circle" size="lg" color="#E91E63" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Ayuda</Text>
                <Text style={styles.settingDescription}>
                  Soporte y preguntas
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size="md"
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </Card>

          {/* Sección de Código Promocional */}
          <Accordion
            title="Código Promocional"
            icon="gift"
            initiallyOpen={false}
            iconColor={Colors.success}
            style={styles.section}
          >
            <Text style={styles.advancedDescription}>
              ¿Tienes un código de promoción? Ingrésalo aquí para desbloquear
              beneficios especiales y descuentos exclusivos.
            </Text>

            <View style={styles.inputContainer}>
              <Icon
                name="ticket"
                size="md"
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.accessInput}
                placeholder="Ingresa tu código"
                placeholderTextColor={Colors.textLight}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="none"
                autoComplete="off"
                editable={!isLoading}
              />
            </View>

            <GradientButton
              title={isLoading ? 'Validando...' : 'Aplicar Código'}
              onPress={handlePromoCode}
              variant="success"
              icon="checkmark-circle"
              fullWidth
              style={styles.continueButton}
              disabled={isLoading}
            />
          </Accordion>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Versión 2.4.1</Text>
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
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading.large,
    color: Colors.text,
    fontWeight: '700',
    fontSize: 28,
  },
  settingsCard: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.body.large,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.body.small,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 76, // Alineado con el texto (48px icono + 16px margen + 12px padding)
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
  footer: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  footerText: {
    ...Typography.body.small,
    color: Colors.textLight,
  },
});

export default GameSettingsScreen;

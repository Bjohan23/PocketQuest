/**
 * Componente SettingRow
 * Fila de configuración reutilizable con icono, texto y acción
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Switch } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import Icon from './Icon';

export interface SettingRowProps {
  /**
   * Icono a la izquierda
   */
  icon?: string;

  /**
   * Texto principal de la configuración
   */
  label: string;

  /**
   * Texto secundario (opcional)
   */
  description?: string;

  /**
   * Si es un toggle, muestra un switch
   */
  value?: boolean;

  /**
   * Callback cuando cambia el valor
   */
  onValueChange?: (value: boolean) => void;

  /**
   * Si es un botón, callback al presionar
   */
  onPress?: () => void;

  /**
   * Componente personalizado a la derecha (en lugar de switch)
   */
  rightComponent?: React.ReactNode;

  /**
   * Estilos adicionales
   */
  style?: ViewStyle;

  /**
   * Color del icono
   */
  iconColor?: string;
}

/**
 * Componente de fila de configuración
 */
const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  description,
  value,
  onValueChange,
  onPress,
  rightComponent,
  style,
  iconColor = Colors.primary,
}) => {
  const isInteractive = onValueChange !== undefined || onPress !== undefined;

  const content = (
    <>
      {icon && (
        <Icon
          name={icon}
          size="lg"
          color={iconColor}
          style={styles.icon}
        />
      )}

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {rightComponent || (
          onValueChange !== undefined ? (
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ false: Colors.borderLight, true: Colors.primaryLight }}
              thumbColor={value ? Colors.primary : Colors.surface}
              ios_backgroundColor={Colors.borderLight}
            />
          ) : onPress && (
            <Icon
              name="chevron-forward"
              size="md"
              color={Colors.textSecondary}
            />
          )
        )}
      </View>
    </>
  );

  if (onPress && onValueChange === undefined) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...Typography.body.large,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  description: {
    ...Typography.body.small,
    color: Colors.textSecondary,
  },
  rightContainer: {
    marginLeft: Spacing.md,
  },
});

export default SettingRow;

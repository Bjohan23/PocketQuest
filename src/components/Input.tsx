/**
 * Componente de Input Reutilizable
 * Campo de texto personalizado con diferentes variantes
 */

import React from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type InputVariant = 'default' | 'underline' | 'outlined';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  variant?: InputVariant;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
  icon?: string;
}

/**
 * Componente de Input reutilizable
 */
const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  variant = 'default',
  style,
  inputStyle,
  multiline = false,
  maxLength,
  editable = true,
  icon,
}: InputProps): React.JSX.Element => {
  /**
   * Obtiene los estilos según la variante del input
   */
  const getInputStyles = () => {
    switch (variant) {
      case 'underline':
        return styles.inputUnderline;
      case 'outlined':
        return styles.inputOutlined;
      default:
        return styles.inputDefault;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}

        <TextInput
          style={[
            styles.input,
            getInputStyles(),
            error && styles.inputError,
            !editable && styles.inputDisabled,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          maxLength={maxLength}
          editable={editable}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 12,
    top: 12,
    fontSize: 18,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
  },
  inputDefault: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
  },
  inputUnderline: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#DDD',
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  inputOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  inputDisabled: {
    backgroundColor: '#EEEEEE',
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 5,
  },
});

export default Input;

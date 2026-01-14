/**
 * Utilidades de Validación
 * Funciones para validar datos de entrada
 */

import { APP_CONFIG } from '../types';

/**
 * Valida un código de acceso
 */
export const validateAccessCode = (code: string): boolean => {
  if (!code || code.trim().length === 0) {
    return false;
  }

  return (
    code === APP_CONFIG.DEFAULT_ACCESS_CODE ||
    code === APP_CONFIG.ADVANCED_ACCESS_CODE
  );
};

/**
 * Valida que un texto no esté vacío
 */
export const validateNotEmpty = (text: string): boolean => {
  return Boolean(text && text.trim().length > 0);
};

/**
 * Valida la longitud mínima de un texto
 */
export const validateMinLength = (text: string, minLength: number): boolean => {
  return Boolean(text && text.trim().length >= minLength);
};

/**
 * Valida la longitud máxima de un texto
 */
export const validateMaxLength = (text: string, maxLength: number): boolean => {
  return Boolean(text && text.trim().length <= maxLength);
};

/**
 * Valida un rango de longitud
 */
export const validateLengthRange = (
  text: string,
  minLength: number,
  maxLength: number,
): boolean => {
  const length = text.trim().length;
  return length >= minLength && length <= maxLength;
};

/**
 * Valida que un número esté en un rango
 */
export const validateNumberRange = (
  num: number,
  min: number,
  max: number,
): boolean => {
  return num >= min && num <= max;
};

/**
 * Valida que un valor sea un número positivo
 */
export const isPositiveNumber = (value: any): boolean => {
  return typeof value === 'number' && value > 0;
};

/**
 * Valida una URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida un número de teléfono (básico)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Obtiene mensajes de error comunes
 */
export const getErrorMessage = (field: string, type: string): string => {
  const messages: Record<string, string> = {
    required: `${field} es requerido`,
    invalid: `${field} no es válido`,
    minLength: `${field} es demasiado corto`,
    maxLength: `${field} es demasiado largo`,
    email: 'El email no es válido',
    phone: 'El número de teléfono no es válido',
    accessCode: 'Código de acceso incorrecto',
  };

  return messages[type] || 'Error de validación';
};

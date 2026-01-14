/**
 * Utilidades de Formato
 * Funciones para formatear fechas, números, etc.
 */

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Ahora';
  }

  if (minutes < 60) {
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  if (hours < 24) {
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  if (days < 7) {
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }

  return date.toLocaleDateString();
};

/**
 * Formatea una fecha en formato corto
 */
export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formatea una hora en formato corto
 */
export const formatShortTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount: number): string => {
  return `${formatNumber(amount)} monedas`;
};

/**
 * Trunca un texto a una longitud máxima
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza la primera letra de un texto
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Genera un ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida la fortaleza de una contraseña
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) {
    return 'weak';
  }

  if (password.length < 10) {
    return 'medium';
  }

  return 'strong';
};

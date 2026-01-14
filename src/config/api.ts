/**
 * Configuración de API
 * URLs base para diferentes entornos
 */

/**
 * Selecciona la URL base según el entorno
 *
 * Android Emulator: usa 10.0.2.2 para acceder a localhost
 * iOS Simulator: usa localhost directamente
 * Dispositivo físico: usa tu IP local
 */
export const API_BASE_URL = 'http://10.0.2.2:3000/api';
export const WS_URL = 'http://10.0.2.2:3000';

// Otras opciones (descomentar según necesites):

// Para iOS Simulator:
// export const API_BASE_URL = 'http://localhost:3000/api';
// export const WS_URL = 'http://localhost:3000';

// Para dispositivo físico (reemplaza con tu IP local):
// export const API_BASE_URL = 'http://192.168.1.100:3000/api';
// export const WS_URL = 'http://192.168.1.100:3000';

// Para producción:
// export const API_BASE_URL = 'https://tu-api-production.com/api';
// export const WS_URL = 'https://tu-api-production.com';

/**
 * Configuración de timeouts (en milisegundos)
 */
export const API_TIMEOUT = 10000;
export const WS_TIMEOUT = 10000;

/**
 * Configuración de reintentos
 */
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000;

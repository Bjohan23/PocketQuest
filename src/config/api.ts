/**
 * Configuración de API
 * URLs base para diferentes entornos
 */

const PROD_URL = 'https://api.pocketquest.johandev.lat';
const DEV_URL = 'http://10.0.2.2:3000'; // Android Emulator

/**
 * Selecciona la URL base automáticamente:
 * - Si es Desarrollo (__DEV__ es true): Usa localhost (10.0.2.2)
 * - Si es Producción (Release APK): Usa johandev.lat
 */
export const API_BASE_URL = __DEV__ ? `${DEV_URL}/api` : `${PROD_URL}/api`;
export const WS_URL = __DEV__ ? DEV_URL : PROD_URL;

// Otras opciones (referencia):
// iOS Simulator: 'http://localhost:3000'
// Físico en LAN: 'http://192.168.1.x:3000'

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

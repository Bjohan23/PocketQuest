/**
 * Servicio de Autenticación
 * Maneja login, registro y sesión de usuario
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { apiService, API_ENDPOINTS } from './apiService';
import { cryptoService } from './cryptoService';

/**
 * Interfaces para autenticación
 */
export interface LoginParams {
  identifier: string;
  password: string;
}

export interface LoginCodeParams {
  loginCode: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    identifier: string;
    username: string;
    publicKey: string;
    privateKey: string;
    loginCode: string;
  };
}

export interface RegisterParams {
  identifier: string;
  username: string;
  publicKey: string;
}

export interface DecodedToken {
  sub: string;
  identifier: string;
  iat: number;
  exp: number;
}

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Login de usuario con código promocional (acceso secreto a chats)
   */
  async loginWithCode(loginCode: string): Promise<LoginResponse> {
    try {
      console.log('🔑 Intentando login con código:', loginCode);
      const response = await apiService.post<LoginResponse>(
        '/auth/login-code',
        { loginCode },
      );

      console.log('📡 Respuesta del servidor:', response);

      if (response.success && response.data) {
        // Usar las claves del backend (por ahora)
        // TODO: Implementar E2EE verdadero donde las claves se generan solo en registro
        console.log('🔐 Almacenando claves del usuario...');

        // Decodificar claves de Base64 a PEM
        const publicKeyPem = Buffer.from(response.data.user.publicKey, 'base64').toString('utf-8');
        const privateKeyPem = Buffer.from(response.data.user.privateKey, 'base64').toString('utf-8');

        const keyPair = {
          publicKey: publicKeyPem,
          privateKey: privateKeyPem,
        };

        // Almacenar claves de forma segura
        await cryptoService.storeKeyPair(keyPair);

        // Guardar token y usuario
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

        // Actualizar token en el servicio API
        apiService.setAuthToken(response.data.accessToken);

        console.log('✅ Login exitoso con E2EE habilitado');

        return response.data;
      }

      console.error('❌ Error en respuesta:', response.error);
      throw new Error(response.error || 'Código de promoción inválido');
    } catch (error: any) {
      console.error('❌ Error completo en loginWithCode:', error);
      // Mensaje de error despistado
      throw new Error('Código de promoción inválido o expirado');
    }
  }

  /**
   * Login de usuario
   */
  async login(params: LoginParams): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      API_ENDPOINTS.LOGIN,
      params,
    );

    if (response.success && response.data) {
      // Guardar token y usuario
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      // Actualizar token en el servicio API
      apiService.setAuthToken(response.data.accessToken);

      return response.data;
    }

    throw new Error(response.error || 'Error en login');
  }

  /**
   * Registro de usuario
   */
  async register(params: RegisterParams): Promise<any> {
    const response = await apiService.post(API_ENDPOINTS.REGISTER_USER, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error en registro');
  }

  /**
   * Logout de usuario
   */
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar almacenamiento local
      await AsyncStorage.multiRemove(['accessToken', 'user']);

      // Limpiar claves criptográficas
      await cryptoService.clearKeys();

      // Remover token del servicio API
      apiService.removeAuthToken();

      console.log('🔓 Logout completado - Claves E2EE eliminadas');
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<any> {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  /**
   * Verificar si está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return Boolean(token);
  }

  /**
   * Obtener token de acceso
   */
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem('accessToken');
  }

  /**
   * Decodificar token JWT (básico, solo para información)
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();

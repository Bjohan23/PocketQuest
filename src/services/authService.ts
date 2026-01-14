/**
 * Servicio de Autenticación
 * Maneja login, registro y sesión de usuario
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, API_ENDPOINTS } from './apiService';

/**
 * Interfaces para autenticación
 */
export interface LoginParams {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    identifier: string;
    publicKey: string;
  };
}

export interface RegisterParams {
  identifier: string;
  publicKey: string;
}

/**
 * Servicio de autenticación
 */
class AuthService {
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
    const response = await apiService.post(
      API_ENDPOINTS.REGISTER_USER,
      params,
    );

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

      // Remover token del servicio API
      apiService.removeAuthToken();
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
}

export const authService = new AuthService();

/**
 * Servicio de API
 * Conectado al backend NestJS de PocketQuest
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

/**
 * Configuración base de la API
 */
const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Servicio de API
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create(API_CONFIG);

    // Interceptor de requests - Agregar token JWT
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Interceptor de responses - Manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Token expirado - Logout
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('user');
          // Aquí se podría navegar a login
        }
        console.error('API Error:', error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Realiza una petición PUT
   */
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Actualiza el token de autenticación
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Elimina el token de autenticación
   */
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Exportar instancia única del servicio
export const apiService = new ApiService();

/**
 * Endpoints de la API - Backend PocketQuest
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',

  // Users
  REGISTER_USER: '/users/register',
  GET_MY_PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
  SEARCH_USERS: '/users/search',

  // Devices
  REGISTER_DEVICE: '/devices',
  GET_MY_DEVICES: '/devices',

  // Chats
  GET_CHATS: '/chats',
  GET_CHAT: '/chats/:id',
  CREATE_CHAT: '/chats',
  ADD_PARTICIPANT: '/chats/:id/participants',

  // Messages
  GET_MESSAGES: '/messages/:chatId',
  MARK_DELIVERED: '/messages/:id/delivered',

  // Media
  UPLOAD_MEDIA: '/media/upload',
  GET_MEDIA: '/media/:id',
  GET_MEDIA_METADATA: '/media/:id/metadata',

  // Presence
  GET_PRESENCE: '/presence/:userId',
  BATCH_PRESENCE: '/presence/batch',
  HEARTBEAT: '/presence/heartbeat',

  // Panic
  LOCK_DEVICE: '/panic/lock',
  LOCK_ALL_DEVICES: '/panic/lock-all',
} as const;

/**
 * Servicio de WebSocket
 * Maneja la conexión en tiempo real con Socket.IO
 */

import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '../config/api';

/**
 * Configuración de WebSocket
 */
const WS_CONFIG = {
  url: WS_URL,
  options: {
    auth: {} as { token?: string },
    transports: ['websocket'] as ('websocket')[],
  },
};

/**
 * Servicio de WebSocket
 */
class WebSocketService {
  private socket: Socket | null = null;

  /**
   * Conectar al servidor WebSocket
   */
  async connect(): Promise<Socket> {
    const token = await AsyncStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token');
    }

    WS_CONFIG.options.auth.token = token;

    this.socket = io(WS_CONFIG.url, WS_CONFIG.options);

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
    });

    return this.socket;
  }

  /**
   * Obtener la instancia del socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Enviar mensaje
   */
  sendMessage(data: {
    chatId: string;
    cipherText: string;
    mediaId?: string;
    ttlHours?: number;
  }): void {
    if (!this.socket) {
      throw new Error('WebSocket no conectado');
    }

    this.socket.emit('send_message', data, (response: any) => {
      console.log('Mensaje enviado:', response);
    });
  }

  /**
   * Confirmar entrega de mensaje
   */
  confirmDelivery(messageId: string): void {
    if (!this.socket) {
      throw new Error('WebSocket no conectado');
    }

    this.socket.emit('message_delivered', { messageId });
  }

  /**
   * Enviar indicador de escritura
   */
  sendTypingIndicator(chatId: string, isTyping: boolean): void {
    if (!this.socket) {
      throw new Error('WebSocket no conectado');
    }

    this.socket.emit('typing', { chatId, isTyping });
  }

  /**
   * Unirse a una sala de chat
   */
  joinChat(chatId: string): void {
    if (!this.socket) {
      throw new Error('WebSocket no conectado');
    }

    this.socket.emit('join_chat', { chatId });
  }

  /**
   * Salir de una sala de chat
   */
  leaveChat(chatId: string): void {
    if (!this.socket) {
      throw new Error('WebSocket no conectado');
    }

    this.socket.emit('leave_chat', { chatId });
  }

  /**
   * Escuchar eventos
   */
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Dejar de escuchar eventos
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

export const webSocketService = new WebSocketService();

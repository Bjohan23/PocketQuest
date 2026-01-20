/**
 * Servicio de WebSocket para mensajería en tiempo real
 * Implementación completa basada en Socket.IO con E2EE
 */

import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '../config/api';
import { cryptoService } from './cryptoService';

interface MessageReceivedPayload {
  id: string;
  chatId: string;
  senderId: string;
  cipherText: string;
  mediaId: string | null;
  ttlExpiresAt: string | null;
  delivered: boolean;
  createdAt: string;
}

interface MessageSentPayload {
  id: string;
  chatId: string;
  senderId: string;
  cipherText: string;
  createdAt: string;
}

interface TypingPayload {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

interface PresencePayload {
  userId: string;
  isOnline: boolean;
}

interface DeliveryConfirmationPayload {
  messageId: string;
  deliveredAt: string;
}

/**
 * Servicio de WebSocket
 */
class WebSocketService {
  private socket: Socket | null = null;
  private accessToken: string | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Conectar al servidor WebSocket
   */
  async connect(token?: string): Promise<Socket> {
    if (this.socket?.connected) {
      console.log('⚠️ WebSocket ya está conectado');
      return this.socket;
    }

    // Obtener token
    const authToken = token || (await AsyncStorage.getItem('accessToken'));

    if (!authToken) {
      throw new Error('No hay token de autenticación');
    }

    this.accessToken = authToken;

    console.log('🔌 Conectando WebSocket a:', WS_URL);
    console.log('🔑 Token (primeros 20 chars):', authToken.substring(0, 20));

    this.socket = io(WS_URL, {
      transports: ['websocket'], // Importante para móvil
      auth: { token: authToken },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Configurar listeners de eventos del servidor
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      this.emitLocal('connected', {});
    });

    this.socket.on('disconnect', reason => {
      console.log('❌ WebSocket desconectado:', reason);
      this.emitLocal('disconnected', { reason });
    });

    this.socket.on('connect_error', error => {
      console.error('⚠️ Error de conexión WebSocket:', error.message);
      this.emitLocal('error', { error: error.message });
    });

    this.socket.on('reconnect', attemptNumber => {
      console.log('🔄 WebSocket reconectado, intento:', attemptNumber);
      this.emitLocal('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ No se pudo reconectar al WebSocket');
      this.emitLocal('reconnect_failed', {});
    });

    // Mensaje recibido
    this.socket.on('message_received', async (data: MessageReceivedPayload) => {
      console.log('📩 Mensaje recibido:', data.id);

      try {
        // Descifrar mensaje
        const decryptedText = await cryptoService.decryptMessage(
          data.cipherText,
        );

        const messageWithDecrypted = {
          ...data,
          decryptedText,
        };

        this.emitLocal('message_received', messageWithDecrypted);

        // Enviar confirmación de entrega automáticamente
        this.confirmDelivery(data.id);
      } catch (error) {
        console.error('❌ Error al descifrar mensaje:', error);
        this.emitLocal('message_received', {
          ...data,
          decryptedText: '[Error al descifrar]',
        });
      }
    });

    // Mensaje enviado (confirmación)
    this.socket.on('message_sent', (data: MessageSentPayload) => {
      console.log('✅ Mensaje enviado confirmado:', data.id);
      this.emitLocal('message_sent', data);
    });

    // Confirmación de entrega
    this.socket.on(
      'delivery_confirmation',
      (data: DeliveryConfirmationPayload) => {
        console.log('✓✓ Mensaje entregado:', data.messageId);
        this.emitLocal('delivery_confirmation', data);
      },
    );

    // Usuario escribiendo
    this.socket.on('user_typing', (data: TypingPayload) => {
      console.log(
        `✍️ Usuario ${data.userId} ${
          data.isTyping ? 'escribiendo' : 'dejó de escribir'
        }`,
      );
      this.emitLocal('user_typing', data);
    });

    // Usuario online
    this.socket.on('user_online', (data: PresencePayload) => {
      console.log('🟢 Usuario online:', data.userId);
      this.emitLocal('user_online', data);
    });

    // Usuario offline
    this.socket.on('user_offline', (data: PresencePayload) => {
      console.log('🔴 Usuario offline:', data.userId);
      this.emitLocal('user_offline', data);
    });
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      console.log('🔌 Desconectando WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.accessToken = null;
      this.listeners.clear();
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Enviar mensaje cifrado
   */
  async sendMessage(params: {
    chatId: string;
    message: string;
    recipientPublicKey: string;
    mediaId?: string | null;
    ttlHours?: number | null;
  }): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket no está conectado');
    }

    const { chatId, message, recipientPublicKey, mediaId, ttlHours } = params;

    try {
      // Cifrar mensaje
      const cipherText = await cryptoService.encryptMessage(
        message,
        recipientPublicKey,
      );

      // Enviar por WebSocket
      this.socket.emit('send_message', {
        chatId,
        cipherText,
        mediaId: mediaId || null,
        ttlHours: ttlHours || null,
      });

      console.log('📤 Mensaje enviado por WebSocket');
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      throw error;
    }
  }

  /**
   * Confirmar entrega de mensaje
   */
  confirmDelivery(messageId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('message_delivered', { messageId });
    console.log('✓ Confirmación de entrega enviada:', messageId);
  }

  /**
   * Enviar indicador de escritura
   */
  sendTypingIndicator(chatId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', { chatId, isTyping });
  }

  /**
   * Unirse a sala de chat
   */
  joinChat(chatId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('join_chat', { chatId });
    console.log('🚪 Unido a chat:', chatId);
  }

  /**
   * Salir de sala de chat
   */
  leaveChat(chatId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('leave_chat', { chatId });
    console.log('🚪 Salido de chat:', chatId);
  }

  /**
   * Registrar listener para eventos locales
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Eliminar listener
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento a listeners locales
   */
  private emitLocal(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de ${event}:`, error);
        }
      });
    }
  }

  /**
   * Obtener la instancia del socket (para compatibilidad)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const webSocketService = new WebSocketService();

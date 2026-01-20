/**
 * Servicio de Mensajes
 * Maneja el envío y recepción de mensajes con cifrado E2EE
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, API_ENDPOINTS } from './apiService';
import { cryptoService } from './cryptoService';

// Clave para almacenamiento local de mensajes propios
const SENT_MESSAGES_CACHE_KEY = 'sentMessagesCache';

/**
 * Interfaces para mensajes
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  cipherText: string;
  decryptedText?: string; // Texto descifrado (solo cliente)
  plainText?: string; // Texto plano de mensajes propios (solo cliente)
  mediaId?: string;
  ttlHours?: number;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  isTemporary?: boolean; // Marca mensajes temporales antes de confirmación del servidor
}

export interface SendMessageParams {
  chatId: string;
  message: string;
  recipientPublicKey: string;
  mediaId?: string;
  ttlHours?: number;
}

export interface GetMessagesParams {
  chatId: string;
  limit?: number;
  before?: string;
}

/**
 * Servicio de mensajes
 */
class MessageService {
  /**
   * Guardar mensaje propio en caché local (público para uso en store)
   */
  async cacheSentMessage(messageId: string, plainText: string): Promise<void> {
    try {
      const cacheStr = await AsyncStorage.getItem(SENT_MESSAGES_CACHE_KEY);
      const cache = cacheStr ? JSON.parse(cacheStr) : {};
      cache[messageId] = plainText;
      await AsyncStorage.setItem(SENT_MESSAGES_CACHE_KEY, JSON.stringify(cache));
      console.log(`💾 Mensaje ${messageId} guardado en caché local`);
    } catch (error) {
      console.error('Error guardando mensaje en caché:', error);
    }
  }

  /**
   * Obtener mensaje propio de caché local
   */
  async getCachedSentMessage(messageId: string): Promise<string | null> {
    try {
      const cacheStr = await AsyncStorage.getItem(SENT_MESSAGES_CACHE_KEY);
      const cache = cacheStr ? JSON.parse(cacheStr) : {};
      return cache[messageId] || null;
    } catch (error) {
      console.error('Error obteniendo mensaje de caché:', error);
      return null;
    }
  }

  /**
   * Enviar mensaje cifrado
   */
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const { chatId, message, recipientPublicKey, mediaId, ttlHours } = params;

    try {
      // Cifrar mensaje con la clave pública del destinatario
      console.log('🔒 Cifrando mensaje...');
      const cipherText = await cryptoService.encryptMessage(
        message,
        recipientPublicKey,
      );

      // Enviar mensaje cifrado al backend
      const response = await apiService.post<Message>(
        `/chats/${chatId}/messages`,
        {
          cipherText,
          mediaId,
          ttlHours,
        },
      );

      if (response.success && response.data) {
        console.log('✅ Mensaje enviado cifrado');
        return response.data;
      }

      throw new Error(response.error || 'Error al enviar mensaje');
    } catch (error: any) {
      console.error('❌ Error al enviar mensaje:', error);
      throw error;
    }
  }

  /**
   * Obtener mensajes de un chat y descifrarlos
   */
  async getMessages(params: GetMessagesParams): Promise<Message[]> {
    const { chatId, limit = 50, before } = params;
    let endpoint = API_ENDPOINTS.GET_MESSAGES.replace(':chatId', chatId);
    endpoint += `?limit=${limit}`;

    if (before) {
      endpoint += `&before=${before}`;
    }

    const response = await apiService.get<Message[]>(endpoint);

    if (response.success && response.data) {
      // Obtener mi ID de usuario
      const currentUserStr = await AsyncStorage.getItem('user');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const myUserId = currentUser?.id;

      console.log(`🔓 Descifrando ${response.data.length} mensajes...`);
      console.log(`👤 Mi usuario ID: ${myUserId}`);

      const decryptedMessages = await Promise.all(
        response.data.map(async msg => {
          try {
            // Si el mensaje es mío, intentar obtenerlo del caché local
            if (msg.senderId === myUserId) {
              const cachedText = await this.getCachedSentMessage(msg.id);
              if (cachedText) {
                console.log(`📤 Mensaje ${msg.id} enviado por mí, recuperado de caché`);
                return {
                  ...msg,
                  decryptedText: cachedText,
                  plainText: cachedText,
                };
              }
              // Si no está en caché, no podemos descifrarlo (está cifrado con clave del destinatario)
              console.log(`⚠️ Mensaje ${msg.id} enviado por mí, NO está en caché (mensaje antiguo)`);
              return {
                ...msg,
                decryptedText: msg.plainText || '[📤 Mensaje enviado]',
              };
            }

            // Descifrar mensajes recibidos de otros usuarios
            console.log(`🔓 Descifrando mensaje ${msg.id} de ${msg.senderId}`);
            const decryptedText = await cryptoService.decryptMessage(
              msg.cipherText,
            );
            return {
              ...msg,
              decryptedText,
            };
          } catch (error) {
            console.error(`❌ Error al descifrar mensaje ${msg.id}:`, error);
            return {
              ...msg,
              decryptedText: '[Mensaje cifrado - Error al descifrar]',
            };
          }
        }),
      );

      console.log('✅ Mensajes descifrados');
      return decryptedMessages;
    }

    throw new Error(response.error || 'Error al obtener mensajes');
  }

  /**
   * Marcar mensaje como entregado
   */
  async markAsDelivered(messageId: string): Promise<void> {
    const endpoint = API_ENDPOINTS.MARK_DELIVERED.replace(':id', messageId);
    await apiService.post(endpoint);
  }

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(messageIds: string[]): Promise<void> {
    // Endpoint personalizado
    await apiService.post('/messages/read', { messageIds });
  }

  /**
   * Limpiar caché de mensajes enviados (llamar en logout)
   */
  async clearSentMessagesCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SENT_MESSAGES_CACHE_KEY);
      console.log('🧹 Caché de mensajes enviados limpiada');
    } catch (error) {
      console.error('Error limpiando caché de mensajes:', error);
    }
  }
}

export const messageService = new MessageService();

/**
 * Servicio de Mensajes
 * Maneja el envío y recepción de mensajes con cifrado E2EE
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, API_ENDPOINTS } from './apiService';
import { cryptoService } from './cryptoService';

/**
 * Interfaces para mensajes
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  cipherText: string;
  decryptedText?: string; // Texto descifrado (solo cliente)
  mediaId?: string;
  ttlHours?: number;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
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
          // Solo descifrar mensajes que NO envié yo
          if (msg.senderId === myUserId) {
            console.log(`📤 Mensaje ${msg.id} enviado por mí, no se descifra`);
            return {
              ...msg,
              decryptedText: '[Mensaje enviado]', // Placeholder para mensajes propios
            };
          }

          // Descifrar mensajes recibidos de otros
          try {
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
            // Si no se puede descifrar, dejar el mensaje sin descifrar
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
}

export const messageService = new MessageService();

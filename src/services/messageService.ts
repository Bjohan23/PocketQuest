/**
 * Servicio de Mensajes
 * Maneja el envío y recepción de mensajes
 */

import { apiService, API_ENDPOINTS } from './apiService';

/**
 * Interfaces para mensajes
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  cipherText: string;
  mediaId?: string;
  ttlHours?: number;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
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
   * Obtener mensajes de un chat
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
      return response.data;
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

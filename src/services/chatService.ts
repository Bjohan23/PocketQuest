/**
 * Servicio de Chats
 * Maneja la gestión de chats y conversaciones
 */

import { apiService, API_ENDPOINTS } from './apiService';

/**
 * Interfaces para chats
 */
export interface CreateChatParams {
  isGroup: boolean;
  participantIds: string[];
}

export interface Chat {
  id: string;
  isGroup: boolean;
  participants: any[];
  lastMessage?: any;
  createdAt: string;
}

/**
 * Servicio de chats
 */
class ChatService {
  /**
   * Obtener todos los chats del usuario
   */
  async getMyChats(): Promise<Chat[]> {
    const response = await apiService.get<Chat[]>(API_ENDPOINTS.GET_CHATS);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al obtener chats');
  }

  /**
   * Obtener detalles de un chat
   */
  async getChatDetails(chatId: string): Promise<Chat> {
    const endpoint = API_ENDPOINTS.GET_CHAT.replace(':id', chatId);
    const response = await apiService.get<Chat>(endpoint);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al obtener chat');
  }

  /**
   * Crear un nuevo chat 1:1
   */
  async createChat(userId: string): Promise<Chat> {
    const params: CreateChatParams = {
      isGroup: false,
      participantIds: [userId],
    };

    const response = await apiService.post<Chat>(API_ENDPOINTS.CREATE_CHAT, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al crear chat');
  }

  /**
   * Crear un chat grupal
   */
  async createGroupChat(userIds: string[]): Promise<Chat> {
    const params: CreateChatParams = {
      isGroup: true,
      participantIds: userIds,
    };

    const response = await apiService.post<Chat>(API_ENDPOINTS.CREATE_CHAT, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al crear chat grupal');
  }

  /**
   * Añadir participante a un grupo
   */
  async addParticipantToGroup(chatId: string, userId: string): Promise<any> {
    const endpoint = API_ENDPOINTS.ADD_PARTICIPANT.replace(':id', chatId);
    const response = await apiService.post(endpoint, { userId });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al añadir participante');
  }
}

export const chatService = new ChatService();

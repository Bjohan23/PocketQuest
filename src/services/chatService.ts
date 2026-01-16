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

export interface ChatParticipant {
  id: string;
  identifier: string;
  name?: string;
  avatarUrl?: string;
  publicKey?: string;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  participants: ChatParticipant[];
  participant?: ChatParticipant; // Para chats 1-a-1
  lastMessage?: any;
  unreadCount?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  cipherText: string;
  mediaId: string | null;
  ttlExpiresAt: string | null;
  delivered: boolean;
  createdAt: string;
}

export interface PresenceStatus {
  userId: string;
  isOnline: boolean;
}

export interface BatchPresenceResponse {
  [userId: string]: boolean;
}

/**
 * Servicio de chats
 */
class ChatService {
  /**
   * Obtener todos los chats del usuario
   */
  async getChats(): Promise<Chat[]> {
    const response = await apiService.get<Chat[]>('/chats');

    if (response.success && response.data) {
      // Procesar chats para extraer participante en chats 1-a-1
      return response.data.map(chat => {
        if (
          !chat.isGroup &&
          chat.participants &&
          chat.participants.length > 0
        ) {
          // En un chat 1-a-1, el participante es el otro usuario (no nosotros)
          return {
            ...chat,
            participant: chat.participants[0], // El backend ya filtra y devuelve solo el otro participante
          };
        }
        return chat;
      });
    }

    throw new Error(response.error || 'Error al obtener chats');
  }

  /**
   * Obtener detalles de un chat por ID
   */
  async getChatById(chatId: string): Promise<Chat> {
    const response = await apiService.get<Chat>(`/chats/${chatId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al obtener chat');
  }

  /**
   * Obtener mensajes de un chat
   */
  async getMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    const response = await apiService.get<Message[]>(
      `/messages/${chatId}?limit=${limit}`,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al obtener mensajes');
  }

  /**
   * Obtener presencia de un usuario
   */
  async getPresence(userId: string): Promise<PresenceStatus> {
    const response = await apiService.get<PresenceStatus>(
      `/presence/${userId}`,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al obtener presencia');
  }

  /**
   * Obtener presencia por lotes
   */
  async getBatchPresence(userIds: string[]): Promise<BatchPresenceResponse> {
    const response = await apiService.post<BatchPresenceResponse>(
      '/presence/batch',
      { userIds },
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al obtener presencias');
  }

  /**
   * Obtener todos los chats del usuario (método legacy)
   */
  async getMyChats(): Promise<Chat[]> {
    return this.getChats();
  }

  /**
   * Obtener detalles de un chat (método legacy)
   */
  async getChatDetails(chatId: string): Promise<Chat> {
    return this.getChatById(chatId);
  }

  /**
   * Crear un nuevo chat 1:1
   */
  async createChat(userId: string): Promise<Chat> {
    const params: CreateChatParams = {
      isGroup: false,
      participantIds: [userId],
    };

    const response = await apiService.post<Chat>(
      API_ENDPOINTS.CREATE_CHAT,
      params,
    );

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

    const response = await apiService.post<Chat>(
      API_ENDPOINTS.CREATE_CHAT,
      params,
    );

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

/**
 * Servicio de Chats
 * Maneja la gestión de chats y conversaciones
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
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
  username: string;
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
   * Decodificar clave pública de Base64 a PEM
   */
  private decodePublicKey(base64Key: string): string {
    try {
      return Buffer.from(base64Key, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decodificando clave pública:', error);
      return base64Key; // Devolver original si falla
    }
  }

  /**
   * Obtener todos los chats del usuario
   */
  async getChats(): Promise<Chat[]> {
    const response = await apiService.get<Chat[]>('/chats');

    if (response.success && response.data) {
      console.log('📥 Chats recibidos del backend:', JSON.stringify(response.data, null, 2));

      // Obtener usuario actual para filtrar participantes
      const currentUserStr = await AsyncStorage.getItem('user');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const myUserId = currentUser?.id;

      console.log('👤 Mi usuario ID:', myUserId);

      // Procesar chats para extraer participante en chats 1-a-1 y decodificar claves
      const processedChats = response.data.map(chat => {
        // Decodificar claves públicas de todos los participantes de Base64 a PEM
        const participantsWithDecodedKeys = chat.participants.map(p => ({
          ...p,
          publicKey: this.decodePublicKey(p.publicKey),
        }));

        if (
          !chat.isGroup &&
          participantsWithDecodedKeys &&
          participantsWithDecodedKeys.length > 0
        ) {
          console.log('👥 Participantes del chat:', participantsWithDecodedKeys);

          // Filtrar para obtener el otro participante (no yo)
          const otherParticipant = participantsWithDecodedKeys.find(
            p => p.id !== myUserId
          );

          console.log('🎯 Participante seleccionado:', otherParticipant);
          console.log('🔑 Clave pública decodificada (primeros 50 chars):', otherParticipant?.publicKey?.substring(0, 50));

          return {
            ...chat,
            participants: participantsWithDecodedKeys,
            participant: otherParticipant,
          };
        }

        return {
          ...chat,
          participants: participantsWithDecodedKeys,
        };
      });

      console.log('✅ Chats procesados con claves decodificadas');
      return processedChats;
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

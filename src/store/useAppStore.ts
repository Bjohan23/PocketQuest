/**
 * Store Global de Pocket Quest
 * Implementa separación de contextos y gestión de estado con Zustand
 */

import { create } from 'zustand';
import {
  GameState,
  GameSettings,
  AuthState,
  Conversation,
  AppMode,
  AppContext,
  Notification,
  APP_CONFIG,
} from '../types';
import { authService, LoginResponse } from '../services/authService';
import { chatService, Chat } from '../services/chatService';
import { messageService, Message } from '../services/messageService';
import { webSocketService } from '../services/webSocketService';
import { cryptoService } from '../services/cryptoService';

// ============================
// STORE DE JUEGO
// ============================

interface GameStore extends GameState {
  // Acciones del juego
  updateLevel: (level: number) => void;
  updateLives: (lives: number) => void;
  updateCoins: (coins: number) => void;
  addCoins: (amount: number) => void;
  addExperience: (amount: number) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetGame: () => void;
}

const initialGameState: GameState = {
  level: 1,
  lives: 3,
  coins: 100,
  soundEnabled: true,
  language: 'es',
  experience: 0,
};

// ============================
// STORE DE AUTENTICACIÓN
// ============================

interface AuthStore extends AuthState {
  // Datos de autenticación
  accessToken: string | null;
  user: LoginResponse['user'] | null;

  // Acciones de autenticación
  loginWithCode: (loginCode: string) => Promise<boolean>;
  logout: () => void;
  setSessionActive: (active: boolean) => void;
  checkAuthStatus: () => Promise<void>;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  accessCode: '',
  requiresAccessCode: false,
  sessionActive: false,
};

// ============================
// STORE DE COMUNICACIÓN
// ============================

interface CommunicationStore {
  conversations: Conversation[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  activeConversationId: string | null;
  temporaryMessagesEnabled: boolean;
  temporaryDuration: number;
  typingUsers: { [chatId: string]: { [userId: string]: boolean } };
  onlineUsers: { [userId: string]: boolean };

  // Acciones de comunicación
  setConversations: (conversations: Conversation[]) => void;
  setChats: (chats: Chat[]) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  addMessage: (
    conversationId: string,
    content: string,
    isFromUser: boolean,
  ) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  replaceTemporaryMessage: (chatId: string, realMessage: Message) => void;
  updateConversationSettings: (
    temporaryEnabled: boolean,
    duration: number,
  ) => void;
  clearConversation: (conversationId: string) => void;
  resetCommunication: () => void;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  setUserTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setupWebSocketListeners: () => void;
}

const initialCommunicationState = {
  conversations: [],
  chats: [],
  messages: {},
  activeConversationId: null,
  temporaryMessagesEnabled: false,
  temporaryDuration: APP_CONFIG.DEFAULT_TEMPORARY_DURATION,
  typingUsers: {},
  onlineUsers: {},
};

// ============================
// STORE DE CONTEXTO DE APLICACIÓN
// ============================

interface AppContextStore extends AppContext {
  // Acciones de contexto
  switchToGameMode: () => void;
  switchToCommunicationMode: () => void;
  enableCommunicationAccess: () => void;
  switchMode: (mode: AppMode) => void;
  resetContext: () => void;
}

const initialAppContext: AppContext = {
  currentMode: 'game',
  canAccessCommunication: false,
  previousMode: undefined,
};

// ============================
// NOTIFICACIONES
// ============================

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  ) => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

// ============================
// STORE UNIFICADO
// ============================

interface AppStore
  extends GameStore,
    AuthStore,
    CommunicationStore,
    AppContextStore,
    NotificationStore {}

export const useAppStore = create<AppStore>((set, get) => ({
  // ============================
  // ESTADO INICIAL DE JUEGO
  // ============================
  ...initialGameState,

  // Acciones de juego
  updateLevel: (level: number) => set({ level }),

  updateLives: (lives: number) => set({ lives }),

  updateCoins: (coins: number) => set({ coins }),

  addCoins: (amount: number) =>
    set(state => ({
      coins: state.coins + amount,
    })),

  addExperience: (amount: number) =>
    set(state => {
      const newExperience = state.experience + amount;
      const experiencePerLevel = 100;
      const newLevel = Math.floor(newExperience / experiencePerLevel) + 1;
      return {
        experience: newExperience,
        level: newLevel,
      };
    }),

  updateSettings: (settings: Partial<GameSettings>) =>
    set(state => ({
      ...state,
      ...settings,
    })),

  resetGame: () => set(initialGameState),

  // ============================
  // ESTADO INICIAL DE AUTENTICACIÓN
  // ============================
  ...initialAuthState,
  accessToken: null,
  user: null,

  // Acciones de autenticación
  login: async (accessCode: string): Promise<boolean> => {
    // Método legacy - ahora redirige a loginWithCode
    return await get().loginWithCode(accessCode);
  },

  loginWithCode: async (loginCode: string) => {
    try {
      const response = await authService.loginWithCode(loginCode);
      set({
        isAuthenticated: true,
        accessCode: loginCode,
        accessToken: response.accessToken,
        user: response.user,
        requiresAccessCode: false,
        sessionActive: true,
        canAccessCommunication: true,
        currentMode: 'communication',
      });

      // Conectar WebSocket
      try {
        await webSocketService.connect(response.accessToken);
        get().setupWebSocketListeners();
        console.log('✅ WebSocket conectado después del login');
      } catch (error) {
        console.error('❌ Error al conectar WebSocket:', error);
      }

      // Cargar chats al autenticarse
      await get().loadChats();

      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  },

  logout: async () => {
    // Desconectar WebSocket
    webSocketService.disconnect();

    // NO limpiar caché de mensajes enviados para mantener acceso después del botón de pánico
    // Con cifrado dual (senderCipherText), los mensajes se pueden recuperar siempre
    // await messageService.clearSentMessagesCache();

    await authService.logout();
    set({
      ...initialAuthState,
      accessToken: null,
      user: null,
      chats: [],
      messages: {},
      typingUsers: {},
      onlineUsers: {},
      currentMode: 'game',
    });
  },

  setSessionActive: (active: boolean) => set({ sessionActive: active }),

  checkAuthStatus: async () => {
    const isAuth = await authService.isAuthenticated();
    if (isAuth) {
      const token = await authService.getAccessToken();
      const user = await authService.getCurrentUser();
      set({
        isAuthenticated: true,
        accessToken: token,
        user,
        canAccessCommunication: true,
      });

      // Conectar WebSocket si hay token
      try {
        await webSocketService.connect(token!);
        get().setupWebSocketListeners();
      } catch (error) {
        console.error('❌ Error al conectar WebSocket:', error);
      }

      await get().loadChats();
    }
  },

  setSessionActive: (active: boolean) => set({ sessionActive: active }),

  // ============================
  // ESTADO INICIAL DE COMUNICACIÓN
  // ============================
  ...initialCommunicationState,

  // Acciones de comunicación
  setConversations: (conversations: Conversation[]) => set({ conversations }),

  setChats: (chats: Chat[]) => set({ chats }),

  setMessages: (chatId: string, messages: Message[]) =>
    set(state => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  loadChats: async () => {
    try {
      const chats = await chatService.getChats();
      set({ chats });
    } catch (error) {
      console.error('Error cargando chats:', error);
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      // Usar messageService que descifra automáticamente
      const messages = await messageService.getMessages({ chatId, limit: 50 });
      get().setMessages(chatId, messages);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  },

  addMessageToChat: (chatId: string, message: Message) =>
    set(state => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  replaceTemporaryMessage: (chatId: string, realMessage: Message) =>
    set(state => {
      const chatMessages = state.messages[chatId] || [];

      console.log(`🔍 Buscando mensaje temporal para reemplazar. ChatId: ${chatId}, SenderId: ${realMessage.senderId}`);
      console.log(`📊 Mensajes actuales en el chat: ${chatMessages.length}`);
      console.log(`📊 Mensajes temporales: ${chatMessages.filter(m => m.isTemporary).length}`);

      // Buscar el mensaje temporal más reciente del mismo usuario
      const tempMessageIndex = chatMessages.findIndex(
        msg => msg.isTemporary && msg.senderId === realMessage.senderId
      );

      if (tempMessageIndex !== -1) {
        // Preservar el plainText del mensaje temporal
        const tempMessage = chatMessages[tempMessageIndex];
        const updatedMessage = {
          ...realMessage,
          plainText: tempMessage.plainText, // Preservar texto plano
          decryptedText: tempMessage.plainText, // Usar para mostrar
          isTemporary: false,
        };

        // Reemplazar mensaje temporal con el real
        const updatedMessages = [...chatMessages];
        updatedMessages[tempMessageIndex] = updatedMessage;

        console.log(`🔄 Mensaje temporal reemplazado con mensaje real: ${realMessage.id}`);
        console.log(`📝 Texto preservado: "${updatedMessage.decryptedText}"`);

        return {
          messages: {
            ...state.messages,
            [chatId]: updatedMessages,
          },
        };
      } else {
        // Si no hay mensaje temporal, agregar como nuevo
        console.log(`⚠️ No se encontró mensaje temporal para senderId: ${realMessage.senderId}`);
        console.log(`📋 IDs de remitentes actuales: ${chatMessages.map(m => `${m.senderId.substring(0, 8)}... (temp: ${m.isTemporary})`).join(', ')}`);
        console.log(`➕ Agregando mensaje: ${realMessage.id}`);
        return {
          messages: {
            ...state.messages,
            [chatId]: [...chatMessages, realMessage],
          },
        };
      }
    }),

  setUserTyping: (chatId: string, userId: string, isTyping: boolean) =>
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: {
          ...(state.typingUsers[chatId] || {}),
          [userId]: isTyping,
        },
      },
    })),

  setUserOnline: (userId: string, isOnline: boolean) =>
    set(state => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: isOnline,
      },
    })),

  setupWebSocketListeners: () => {
    // Mensaje recibido (tanto de otros usuarios como confirmación de propios)
    webSocketService.on('message_received', async (message: any) => {
      console.log('📩 Nuevo mensaje recibido en store:', message.id);
      console.log('📦 Mensaje completo:', JSON.stringify(message, null, 2));

      // Validación defensiva: verificar que tenemos user
      const state = get();
      const myUserId = state.user?.id;

      console.log('👤 Mi userId:', myUserId);
      console.log('👤 Mensaje senderId:', message.senderId);

      if (!myUserId) {
        console.warn('⚠️ No hay usuario autenticado, ignorando mensaje');
        return;
      }

      // Si es nuestro propio mensaje, reemplazar el temporal con confirmación del servidor
      if (message.senderId === myUserId) {
        console.log('✅ Mensaje propio confirmado por el servidor, reemplazando temporal');

        // Guardar en caché el texto plano del mensaje temporal
        const chatMessages = state.messages[message.chatId] || [];
        const tempMessage = chatMessages.find(m => m.isTemporary && m.senderId === myUserId);
        if (tempMessage && (tempMessage as any).plainText) {
          // Guardar en caché para poder verlo después
          console.log(`💾 Guardando mensaje en caché: "${(tempMessage as any).plainText}"`);
          await messageService.cacheSentMessage(message.id, (tempMessage as any).plainText);
        } else if ((message as any).senderCipherText) {
          // Si no hay mensaje temporal pero sí senderCipherText, descifrar y guardar
          console.log('🔓 Descifrando senderCipherText del mensaje propio');
          try {
            const decryptedText = await cryptoService.decryptMessage((message as any).senderCipherText);
            await messageService.cacheSentMessage(message.id, decryptedText);
            console.log(`💾 Mensaje descifrado y guardado en caché: "${decryptedText}"`);
          } catch (error) {
            console.error('❌ Error descifrando senderCipherText:', error);
          }
        } else {
          console.warn('⚠️ No se encontró mensaje temporal ni senderCipherText');
        }

        state.replaceTemporaryMessage(message.chatId, message);
        return;
      }

      console.log('✅ Mensaje es de otro usuario, procesando...');

      // Verificar si el mensaje ya existe en el store (evitar duplicados)
      const existingMessages = state.messages[message.chatId] || [];
      if (existingMessages.some(m => m.id === message.id)) {
        console.log('ℹ️ Mensaje ya existe en el store, ignorando duplicado');
        return;
      }

      // Descifrar el mensaje antes de agregarlo a la UI
      try {
        const { cryptoService } = await import('../services/cryptoService');
        const decryptedText = await cryptoService.decryptMessage(message.cipherText);

        console.log('🔓 Mensaje descifrado en tiempo real');

        state.addMessageToChat(message.chatId, {
          ...message,
          decryptedText,
        });
      } catch (error) {
        console.error('❌ Error descifrando mensaje en tiempo real:', error);
        // Si falla el descifrado, agregar con placeholder
        state.addMessageToChat(message.chatId, {
          ...message,
          decryptedText: '[Mensaje cifrado - Error al descifrar]',
        });
      }
    });

    // Mensaje enviado (confirmación del servidor)
    // NOTA: Este evento es redundante ahora que message_received también llega al remitente
    // Lo ignoramos completamente para evitar duplicados
    webSocketService.on('message_sent', (message: any) => {
      console.log('✅ Mensaje enviado confirmado (message_sent):', message.id, '- IGNORADO (ya procesado por message_received)');
      // No hacemos nada - message_received ya lo manejó
    });

    // Confirmación de entrega
    webSocketService.on('delivery_confirmation', (data: any) => {
      console.log('✓✓ Mensaje entregado:', data.messageId);
      // Actualizar estado del mensaje a "entregado"
    });

    // Usuario escribiendo
    webSocketService.on('user_typing', (data: any) => {
      get().setUserTyping(data.chatId, data.userId, data.isTyping);
    });

    // Usuario online
    webSocketService.on('user_online', (data: any) => {
      get().setUserOnline(data.userId, true);
    });

    // Usuario offline
    webSocketService.on('user_offline', (data: any) => {
      get().setUserOnline(data.userId, false);
    });
  },

  setActiveConversation: (conversationId: string | null) =>
    set({ activeConversationId: conversationId }),

  addMessage: (conversationId: string, content: string, isFromUser: boolean) =>
    set(state => {
      const conversations = state.conversations.map(conv => {
        if (conv.id === conversationId) {
          const newMessage = {
            id: `msg-${Date.now()}`,
            conversationId,
            content,
            timestamp: new Date(),
            isFromUser,
          };

          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: content,
            lastMessageTime: new Date(),
            unreadCount: isFromUser ? 0 : conv.unreadCount + 1,
          };
        }
        return conv;
      });

      return { conversations };
    }),

  updateConversationSettings: (temporaryEnabled: boolean, duration: number) =>
    set({
      temporaryMessagesEnabled: temporaryEnabled,
      temporaryDuration: duration,
    }),

  clearConversation: (conversationId: string) =>
    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [], lastMessage: undefined, unreadCount: 0 }
          : conv,
      ),
    })),

  resetCommunication: () =>
    set({
      ...initialCommunicationState,
      activeConversationId: null,
    }),

  // ============================
  // ESTADO INICIAL DE CONTEXTO
  // ============================
  ...initialAppContext,

  // Acciones de contexto
  switchToGameMode: () =>
    set(state => ({
      currentMode: 'game',
      previousMode: state.currentMode,
    })),

  switchToCommunicationMode: () =>
    set(state => ({
      currentMode: 'communication',
      previousMode: state.currentMode,
    })),

  enableCommunicationAccess: () =>
    set({
      canAccessCommunication: true,
    }),

  switchMode: (mode: AppMode) =>
    set(state => ({
      currentMode: mode,
      previousMode: state.currentMode,
    })),

  resetContext: () =>
    set({
      ...initialAppContext,
      canAccessCommunication: get().canAccessCommunication, // Mantener permisos
    }),

  // ============================
  // ESTADO INICIAL DE NOTIFICACIONES
  // ============================
  notifications: [],

  // Acciones de notificaciones
  addNotification: notification =>
    set(state => ({
      notifications: [
        {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  markAsRead: (notificationId: string) =>
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

// ============================
// SELECTORES PERSONALIZADOS
// ============================

export const selectGameState = () => useAppStore.getState();

export const selectGameMode = (state: AppStore) => state.currentMode;

export const selectCanAccessCommunication = (state: AppStore) =>
  state.canAccessCommunication;

export const selectActiveConversation = (state: AppStore) =>
  state.conversations.find(c => c.id === state.activeConversationId);

export const selectUnreadNotifications = (state: AppStore) =>
  state.notifications.filter(n => !n.read);

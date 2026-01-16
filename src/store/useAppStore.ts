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
import { chatService, Chat, Message } from '../services/chatService';
import { messageService } from '../services/messageService';
import { webSocketService } from '../services/webSocketService';

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
    // Mensaje recibido
    webSocketService.on('message_received', (message: any) => {
      console.log('📩 Nuevo mensaje recibido en store:', message.id);
      get().addMessageToChat(message.chatId, message);
    });

    // Mensaje enviado (confirmación)
    webSocketService.on('message_sent', (message: any) => {
      console.log('✅ Mensaje enviado confirmado en store:', message.id);
      // Actualizar estado del mensaje a "enviado"
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

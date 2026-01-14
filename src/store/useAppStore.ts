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

// ============================
// STORE DE JUEGO
// ============================

interface GameStore extends GameState {
  // Acciones del juego
  updateLevel: (level: number) => void;
  updateLives: (lives: number) => void;
  updateCoins: (coins: number) => void;
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
  // Acciones de autenticación
  login: (accessCode: string) => Promise<boolean>;
  logout: () => void;
  setSessionActive: (active: boolean) => void;
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
  activeConversationId: string | null;
  temporaryMessagesEnabled: boolean;
  temporaryDuration: number;

  // Acciones de comunicación
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  addMessage: (
    conversationId: string,
    content: string,
    isFromUser: boolean,
  ) => void;
  updateConversationSettings: (
    temporaryEnabled: boolean,
    duration: number,
  ) => void;
  clearConversation: (conversationId: string) => void;
  resetCommunication: () => void;
}

const initialCommunicationState = {
  conversations: [
    {
      id: '1',
      name: 'Equipo Pocket Quest',
      lastMessage: '¡Bienvenido al modo comunicación!',
      lastMessageTime: new Date(),
      unreadCount: 1,
      onlineStatus: 'online' as const,
      messages: [
        {
          id: 'm1',
          conversationId: '1',
          content: '¡Bienvenido al modo comunicación!',
          timestamp: new Date(),
          isFromUser: false,
        },
      ],
    },
    {
      id: '2',
      name: 'Misión Diaria',
      lastMessage: 'Nueva misión disponible',
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 0,
      onlineStatus: 'online' as const,
      messages: [
        {
          id: 'm2',
          conversationId: '2',
          content: 'Nueva misión disponible',
          timestamp: new Date(Date.now() - 3600000),
          isFromUser: false,
        },
      ],
    },
  ],
  activeConversationId: null,
  temporaryMessagesEnabled: false,
  temporaryDuration: APP_CONFIG.DEFAULT_TEMPORARY_DURATION,
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
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

// ============================
// STORE UNIFICADO
// ============================

interface AppStore extends GameStore, AuthStore, CommunicationStore, AppContextStore, NotificationStore {}

export const useAppStore = create<AppStore>((set, get) => ({
  // ============================
  // ESTADO INICIAL DE JUEGO
  // ============================
  ...initialGameState,

  // Acciones de juego
  updateLevel: (level: number) => set({ level }),

  updateLives: (lives: number) => set({ lives }),

  updateCoins: (coins: number) => set({ coins }),

  addExperience: (amount: number) =>
    set((state) => {
      const newExperience = state.experience + amount;
      const experiencePerLevel = 100;
      const newLevel = Math.floor(newExperience / experiencePerLevel) + 1;
      return {
        experience: newExperience,
        level: newLevel,
      };
    }),

  updateSettings: (settings: Partial<GameSettings>) =>
    set((state) => ({
      ...state,
      ...settings,
    })),

  resetGame: () => set(initialGameState),

  // ============================
  // ESTADO INICIAL DE AUTENTICACIÓN
  // ============================
  ...initialAuthState,

  // Acciones de autenticación
  login: async (accessCode: string): Promise<boolean> => {
    // Validación simulada del código de acceso
    const isValidCode =
      accessCode === APP_CONFIG.DEFAULT_ACCESS_CODE ||
      accessCode === APP_CONFIG.ADVANCED_ACCESS_CODE;

    if (isValidCode) {
      set({
        isAuthenticated: true,
        accessCode,
        requiresAccessCode: false,
        sessionActive: true,
      });
      return true;
    }

    return false;
  },

  logout: () =>
    set({
      isAuthenticated: false,
      accessCode: '',
      sessionActive: false,
    }),

  setSessionActive: (active: boolean) => set({ sessionActive: active }),

  // ============================
  // ESTADO INICIAL DE COMUNICACIÓN
  // ============================
  ...initialCommunicationState,

  // Acciones de comunicación
  setConversations: (conversations: Conversation[]) => set({ conversations }),

  setActiveConversation: (conversationId: string | null) =>
    set({ activeConversationId: conversationId }),

  addMessage: (conversationId: string, content: string, isFromUser: boolean) =>
    set((state) => {
      const conversations = state.conversations.map((conv) => {
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
    set((state) => ({
      conversations: state.conversations.map((conv) =>
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
    set((state) => ({
      currentMode: 'game',
      previousMode: state.currentMode,
    })),

  switchToCommunicationMode: () =>
    set((state) => ({
      currentMode: 'communication',
      previousMode: state.currentMode,
    })),

  enableCommunicationAccess: () =>
    set({
      canAccessCommunication: true,
    }),

  switchMode: (mode: AppMode) =>
    set((state) => ({
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
  addNotification: (notification) =>
    set((state) => ({
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
    set((state) => ({
      notifications: state.notifications.map((notif) =>
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
  state.conversations.find((c) => c.id === state.activeConversationId);

export const selectUnreadNotifications = (state: AppStore) =>
  state.notifications.filter((n) => !n.read);

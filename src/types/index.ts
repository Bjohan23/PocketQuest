/**
 * Tipos e interfaces principales de Pocket Quest
 * Arquitectura modular con separación de contextos
 */

// ============================
// TIPOS DE NAVEGACIÓN
// ============================

export type RootStackParamList = {
  GameStack: undefined;
  Access: undefined;
  CommunicationStack: undefined;
};

export type GameStackParamList = {
  GameHome: undefined;
  GameSettings: undefined;
  GameShop: undefined;
  WhackAMoleGame: undefined;
  SnakeGame: undefined;
};

export type CommunicationStackParamList = {
  ConversationList: undefined;
  Conversation: { conversationId: string };
  ConversationSettings: { conversationId: string };
};

// ============================
// TIPOS DEL MODO JUEGO
// ============================

export interface GameState {
  level: number;
  lives: number;
  coins: number;
  soundEnabled: boolean;
  language: 'es' | 'en';
  experience: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  language: 'es' | 'en';
  notificationsEnabled: boolean;
}

// ============================
// TIPOS DEL MODO COMUNICACIÓN
// ============================

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  timestamp: Date;
  isFromUser: boolean;
  isTemporary?: boolean;
  temporaryDuration?: number; // en segundos
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  onlineStatus: 'online' | 'offline' | 'away';
  avatar?: string;
  messages: Message[];
}

export interface ConversationSettings {
  temporaryMessagesEnabled: boolean;
  temporaryDuration: number; // en segundos
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

// ============================
// TIPOS DE AUTENTICACIÓN
// ============================

export interface AuthState {
  isAuthenticated: boolean;
  accessCode: string;
  requiresAccessCode: boolean;
  sessionActive: boolean;
}

// ============================
// TIPOS DE CONTEXTO DE APLICACIÓN
// ============================

export type AppMode = 'game' | 'communication';

export interface AppContext {
  currentMode: AppMode;
  canAccessCommunication: boolean;
  previousMode?: AppMode;
}

// ============================
// TIPOS DE NOTIFICACIONES
// ============================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'game' | 'challenge' | 'reward' | 'content';
  timestamp: Date;
  read: boolean;
}

export type NotificationType = Notification['type'];

// ============================
// TIPOS DE SERVICIOS (PREPARACIÓN BACKEND)
// ============================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  accessCode: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface ConversationResponse {
  id: string;
  name: string;
  unreadCount: number;
  onlineStatus: string;
}

// ============================
// CONSTANTES DE APLICACIÓN
// ============================

export const APP_CONFIG = {
  // Códigos de acceso (simulados)
  DEFAULT_ACCESS_CODE: 'POCKET2025',
  ADVANCED_ACCESS_CODE: 'ADVANCED2025',

  // Configuración de mensajes temporales
  DEFAULT_TEMPORARY_DURATION: 60, // 60 segundos

  // Configuración de notificaciones
  NOTIFICATION_TYPES: {
    CHALLENGE: 'Nuevo desafío disponible',
    REWARD: 'Recompensas pendientes',
    CONTENT: 'Contenido nuevo desbloqueado',
  } as const,
} as const;

// ============================
// UTILIDADES DE TIPO
// ============================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

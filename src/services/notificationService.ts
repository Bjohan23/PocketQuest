/**
 * Servicio de Notificaciones
 * Implementación simulada de notificaciones locales
 */

import { Notification, NotificationType } from '../types';

/**
 * Servicio de notificaciones simulado
 */
class NotificationService {
  /**
   * Crea una nueva notificación
   */
  createNotification(
    title: string,
    message: string,
    type: NotificationType,
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    return {
      title,
      message,
      type,
    };
  }

  /**
   * Genera notificaciones aleatorias del juego
   */
  generateRandomNotification(): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    const notifications = [
      {
        title: 'Nuevo Desafío',
        message: '¡Un nuevo desafío está disponible!',
        type: 'challenge' as const,
      },
      {
        title: 'Recompensas',
        message: 'Tienes recompensas pendientes',
        type: 'reward' as const,
      },
      {
        title: 'Contenido',
        message: 'Contenido nuevo desbloqueado',
        type: 'content' as const,
      },
    ];

    return notifications[Math.floor(Math.random() * notifications.length)];
  }

  /**
   * Genera una notificación de desafío
   */
  createChallengeNotification(
    challengeName?: string,
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    return {
      title: 'Nuevo Desafío',
      message: challengeName
        ? `¡Desafío "${challengeName}" disponible!`
        : '¡Un nuevo desafío está disponible!',
      type: 'challenge',
    };
  }

  /**
   * Genera una notificación de recompensa
   */
  createRewardNotification(
    amount?: number,
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    return {
      title: 'Recompensas',
      message: amount
        ? `Has ganado ${amount} monedas`
        : 'Tienes recompensas pendientes',
      type: 'reward',
    };
  }

  /**
   * Genera una notificación de contenido
   */
  createContentNotification(
    contentName?: string,
  ): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    return {
      title: 'Contenido',
      message: contentName
        ? `¡${contentName} desbloqueado!`
        : 'Contenido nuevo desbloqueado',
      type: 'content',
    };
  }
}

// Exportar instancia única del servicio
export const notificationService = new NotificationService();

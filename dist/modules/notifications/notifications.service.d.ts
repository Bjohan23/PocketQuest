export interface NotificationPayload {
    messageId: string;
    chatId: string;
    senderId: string;
}
export declare class NotificationsService {
    private readonly logger;
    sendNotification(userId: string, pushToken: string, payload: NotificationPayload): Promise<void>;
    sendBulkNotifications(userIds: string[], payload: NotificationPayload): Promise<void>;
}

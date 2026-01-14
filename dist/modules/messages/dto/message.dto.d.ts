export declare class SendMessageDto {
    chatId: string;
    cipherText: string;
    mediaId?: string;
    ttlHours?: number;
}
export declare class MessageResponseDto {
    id: string;
    chatId: string;
    senderId: string;
    cipherText: string;
    mediaId: string | null;
    ttlExpiresAt: Date | null;
    delivered: boolean;
    createdAt: Date;
}
export declare class GetMessagesDto {
    limit?: number;
    before?: string;
}

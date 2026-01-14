import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../modules/messages/messages.service';
import { PresenceService } from '../modules/presence/presence.service';
import { SendMessageDto } from '../modules/messages/dto/message.dto';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messagesService;
    private presenceService;
    server: Server;
    private readonly logger;
    constructor(messagesService: MessagesService, presenceService: PresenceService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleSendMessage(client: Socket, data: SendMessageDto): Promise<{
        success: boolean;
        messageId: string;
    }>;
    handleMessageDelivered(client: Socket, data: {
        messageId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleTyping(client: Socket, data: {
        chatId: string;
        isTyping: boolean;
    }): Promise<{
        success: boolean;
    }>;
    handleJoinChat(client: Socket, data: {
        chatId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleLeaveChat(client: Socket, data: {
        chatId: string;
    }): Promise<{
        success: boolean;
    }>;
    private getParticipants;
    disconnectUser(userId: string): Promise<void>;
}

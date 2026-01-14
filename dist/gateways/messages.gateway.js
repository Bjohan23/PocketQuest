"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagesGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const ws_jwt_guard_1 = require("../common/guards/ws-jwt.guard");
const messages_service_1 = require("../modules/messages/messages.service");
const presence_service_1 = require("../modules/presence/presence.service");
const message_dto_1 = require("../modules/messages/dto/message.dto");
let MessagesGateway = MessagesGateway_1 = class MessagesGateway {
    constructor(messagesService, presenceService) {
        this.messagesService = messagesService;
        this.presenceService = presenceService;
        this.logger = new common_1.Logger(MessagesGateway_1.name);
    }
    async handleConnection(client) {
        try {
            const userId = client.data.user?.sub;
            if (!userId) {
                client.disconnect();
                return;
            }
            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
            await this.presenceService.setOnline(userId);
            client.join(`user:${userId}`);
            this.server.emit('user_online', { userId });
        }
        catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        try {
            const userId = client.data.user?.sub;
            if (userId) {
                this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
                await this.presenceService.setOffline(userId);
                this.server.emit('user_offline', { userId });
            }
        }
        catch (error) {
            this.logger.error(`Disconnection error: ${error.message}`);
        }
    }
    async handleSendMessage(client, data) {
        try {
            const userId = client.data.user?.sub;
            const message = await this.messagesService.send(userId, data);
            const participants = await this.getParticipants(data.chatId);
            participants.forEach(participantId => {
                if (participantId !== userId) {
                    this.server.to(`user:${participantId}`).emit('message_received', message);
                }
            });
            client.emit('message_sent', message);
            return { success: true, messageId: message.id };
        }
        catch (error) {
            this.logger.error(`Send message error: ${error.message}`);
            throw new websockets_1.WsException(error.message);
        }
    }
    async handleMessageDelivered(client, data) {
        try {
            await this.messagesService.markDelivered(data.messageId);
            const message = await this.messagesService.findOne(data.messageId);
            this.server.to(`user:${message.senderId}`).emit('delivery_confirmation', {
                messageId: data.messageId,
                deliveredAt: new Date(),
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Message delivered error: ${error.message}`);
            throw new websockets_1.WsException(error.message);
        }
    }
    async handleTyping(client, data) {
        try {
            const userId = client.data.user?.sub;
            const { chatId, isTyping } = data;
            const participants = await this.getParticipants(chatId);
            participants.forEach(participantId => {
                if (participantId !== userId) {
                    this.server.to(`user:${participantId}`).emit('user_typing', {
                        chatId,
                        userId,
                        isTyping,
                    });
                }
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Typing indicator error: ${error.message}`);
            throw new websockets_1.WsException(error.message);
        }
    }
    async handleJoinChat(client, data) {
        client.join(`chat:${data.chatId}`);
        return { success: true };
    }
    async handleLeaveChat(client, data) {
        client.leave(`chat:${data.chatId}`);
        return { success: true };
    }
    async getParticipants(chatId) {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const participants = await prisma.chatParticipant.findMany({
            where: { chatId },
            select: { userId: true },
        });
        await prisma.$disconnect();
        return participants.map(p => p.userId);
    }
    async disconnectUser(userId) {
        const sockets = await this.server.in(`user:${userId}`).fetchSockets();
        sockets.forEach(socket => socket.disconnect());
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message_delivered'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMessageDelivered", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleLeaveChat", null);
exports.MessagesGateway = MessagesGateway = MessagesGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        presence_service_1.PresenceService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map
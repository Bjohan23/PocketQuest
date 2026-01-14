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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let MessagesService = class MessagesService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async send(userId, sendMessageDto) {
        const { chatId, cipherText, mediaId, ttlHours } = sendMessageDto;
        const participant = await this.prisma.chatParticipant.findFirst({
            where: {
                chatId,
                userId,
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a participant in this chat');
        }
        let ttlExpiresAt = null;
        if (ttlHours) {
            ttlExpiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
        }
        const message = await this.prisma.message.create({
            data: {
                chatId,
                senderId: userId,
                cipherText,
                mediaId,
                ttlExpiresAt,
            },
        });
        return this.toResponseDto(message);
    }
    async findAll(userId, chatId, getMessagesDto) {
        const participant = await this.prisma.chatParticipant.findFirst({
            where: { chatId, userId },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a participant in this chat');
        }
        const { limit = 50, before } = getMessagesDto;
        const messages = await this.prisma.message.findMany({
            where: {
                chatId,
                ...(before && {
                    createdAt: {
                        lt: (await this.prisma.message.findUnique({ where: { id: before } }))?.createdAt,
                    },
                }),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return messages.map(msg => this.toResponseDto(msg));
    }
    async markDelivered(messageId) {
        await this.prisma.message.update({
            where: { id: messageId },
            data: { delivered: true },
        });
    }
    async findOne(messageId) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        return this.toResponseDto(message);
    }
    async deleteExpired() {
        const result = await this.prisma.message.deleteMany({
            where: {
                ttlExpiresAt: {
                    lte: new Date(),
                },
            },
        });
        return result.count;
    }
    toResponseDto(message) {
        return {
            id: message.id,
            chatId: message.chatId,
            senderId: message.senderId,
            cipherText: message.cipherText,
            mediaId: message.mediaId,
            ttlExpiresAt: message.ttlExpiresAt,
            delivered: message.delivered,
            createdAt: message.createdAt,
        };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map
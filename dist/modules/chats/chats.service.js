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
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChatsService = class ChatsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createChatDto) {
        const { isGroup, participantIds } = createChatDto;
        const allParticipantIds = [...new Set([userId, ...participantIds])];
        if (!isGroup && allParticipantIds.length !== 2) {
            throw new common_1.BadRequestException('1:1 chat must have exactly 2 participants');
        }
        if (!isGroup) {
            const existingChat = await this.findExisting1to1Chat(allParticipantIds);
            if (existingChat) {
                return existingChat;
            }
        }
        const chat = await this.prisma.chat.create({
            data: {
                isGroup,
                participants: {
                    create: allParticipantIds.map(participantId => ({
                        userId: participantId,
                    })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                identifier: true,
                            },
                        },
                    },
                },
            },
        });
        return this.toResponseDto(chat);
    }
    async findAll(userId) {
        const chats = await this.prisma.chat.findMany({
            where: {
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                identifier: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return chats.map(chat => this.toResponseDto(chat));
    }
    async findOne(userId, chatId) {
        const chat = await this.prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                identifier: true,
                            },
                        },
                    },
                },
            },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        return this.toResponseDto(chat);
    }
    async addParticipant(userId, chatId, addParticipantDto) {
        const chat = await this.prisma.chat.findFirst({
            where: {
                id: chatId,
                isGroup: true,
                participants: {
                    some: { userId },
                },
            },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Group chat not found');
        }
        await this.prisma.chatParticipant.create({
            data: {
                chatId,
                userId: addParticipantDto.userId,
            },
        });
        return this.findOne(userId, chatId);
    }
    async findExisting1to1Chat(participantIds) {
        const chats = await this.prisma.chat.findMany({
            where: {
                isGroup: false,
                participants: {
                    every: {
                        userId: { in: participantIds },
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                identifier: true,
                            },
                        },
                    },
                },
            },
        });
        const exactMatch = chats.find(chat => chat.participants.length === participantIds.length &&
            chat.participants.every(p => participantIds.includes(p.userId)));
        return exactMatch ? this.toResponseDto(exactMatch) : null;
    }
    toResponseDto(chat) {
        return {
            id: chat.id,
            isGroup: chat.isGroup,
            createdAt: chat.createdAt,
            participants: chat.participants.map((p) => ({
                id: p.user.id,
                identifier: p.user.identifier,
            })),
        };
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map
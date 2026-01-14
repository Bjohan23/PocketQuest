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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const fs = require("fs/promises");
const path = require("path");
const uuid_1 = require("uuid");
let MediaService = class MediaService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.storagePath = this.configService.get('media.storagePath');
    }
    async upload(userId, file) {
        const userDir = path.join(this.storagePath, userId);
        await fs.mkdir(userDir, { recursive: true });
        const filename = `${(0, uuid_1.v4)()}.bin`;
        const filePath = path.join(userDir, filename);
        await fs.writeFile(filePath, file.buffer);
        const media = await this.prisma.media.create({
            data: {
                ownerId: userId,
                filePath,
                mimeType: file.mimetype,
                size: file.size,
            },
        });
        return this.toResponseDto(media);
    }
    async findOne(userId, mediaId) {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        const hasAccess = await this.verifyAccess(userId, mediaId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.toResponseDto(media);
    }
    async download(userId, mediaId) {
        const media = await this.findOne(userId, mediaId);
        const buffer = await fs.readFile(media.filePath);
        return {
            buffer,
            mimeType: media.mimeType,
        };
    }
    async delete(userId, mediaId) {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        if (media.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the owner can delete this media');
        }
        try {
            await fs.unlink(media.filePath);
        }
        catch (error) {
        }
        await this.prisma.media.delete({
            where: { id: mediaId },
        });
    }
    async deleteByFilePath(filePath) {
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
        }
        await this.prisma.media.deleteMany({
            where: { filePath },
        });
    }
    async verifyAccess(userId, mediaId) {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
            include: {
                messages: {
                    include: {
                        chat: {
                            include: {
                                participants: true,
                            },
                        },
                    },
                },
            },
        });
        if (!media) {
            return false;
        }
        if (media.ownerId === userId) {
            return true;
        }
        for (const message of media.messages) {
            const isParticipant = message.chat.participants.some(p => p.userId === userId);
            if (isParticipant) {
                return true;
            }
        }
        return false;
    }
    toResponseDto(media) {
        return {
            id: media.id,
            ownerId: media.ownerId,
            filePath: media.filePath,
            mimeType: media.mimeType,
            size: media.size,
            createdAt: media.createdAt,
        };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map
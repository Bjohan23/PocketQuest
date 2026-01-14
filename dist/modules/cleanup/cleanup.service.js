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
var CleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const media_service_1 = require("../media/media.service");
let CleanupService = CleanupService_1 = class CleanupService {
    constructor(prisma, mediaService) {
        this.prisma = prisma;
        this.mediaService = mediaService;
        this.logger = new common_1.Logger(CleanupService_1.name);
    }
    async cleanupExpiredMessages() {
        this.logger.log('Starting cleanup of expired messages...');
        try {
            const expiredMessages = await this.prisma.message.findMany({
                where: {
                    ttlExpiresAt: {
                        lte: new Date(),
                    },
                },
                include: {
                    media: true,
                },
            });
            this.logger.log(`Found ${expiredMessages.length} expired messages`);
            for (const message of expiredMessages) {
                if (message.media) {
                    try {
                        await this.mediaService.deleteByFilePath(message.media.filePath);
                        this.logger.log(`Deleted media file: ${message.media.filePath}`);
                    }
                    catch (error) {
                        this.logger.error(`Failed to delete media file: ${message.media.filePath}`, error);
                    }
                }
            }
            const result = await this.prisma.message.deleteMany({
                where: {
                    ttlExpiresAt: {
                        lte: new Date(),
                    },
                },
            });
            this.logger.log(`Cleanup complete. Deleted ${result.count} expired messages`);
        }
        catch (error) {
            this.logger.error('Cleanup failed', error);
        }
    }
    async runManualCleanup() {
        this.logger.log('Manual cleanup triggered');
        await this.cleanupExpiredMessages();
        const count = await this.prisma.message.count({
            where: {
                ttlExpiresAt: {
                    lte: new Date(),
                },
            },
        });
        return { deletedMessages: count };
    }
};
exports.CleanupService = CleanupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupService.prototype, "cleanupExpiredMessages", null);
exports.CleanupService = CleanupService = CleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        media_service_1.MediaService])
], CleanupService);
//# sourceMappingURL=cleanup.service.js.map
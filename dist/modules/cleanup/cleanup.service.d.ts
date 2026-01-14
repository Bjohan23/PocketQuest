import { PrismaService } from '../../prisma/prisma.service';
import { MediaService } from '../media/media.service';
export declare class CleanupService {
    private prisma;
    private mediaService;
    private readonly logger;
    constructor(prisma: PrismaService, mediaService: MediaService);
    cleanupExpiredMessages(): Promise<void>;
    runManualCleanup(): Promise<{
        deletedMessages: number;
    }>;
}

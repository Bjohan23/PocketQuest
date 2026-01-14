import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MediaResponseDto } from './dto/media.dto';
export declare class MediaService {
    private prisma;
    private configService;
    private readonly storagePath;
    constructor(prisma: PrismaService, configService: ConfigService);
    upload(userId: string, file: Express.Multer.File): Promise<MediaResponseDto>;
    findOne(userId: string, mediaId: string): Promise<MediaResponseDto>;
    download(userId: string, mediaId: string): Promise<{
        buffer: Buffer;
        mimeType: string;
    }>;
    delete(userId: string, mediaId: string): Promise<void>;
    deleteByFilePath(filePath: string): Promise<void>;
    private verifyAccess;
    private toResponseDto;
}

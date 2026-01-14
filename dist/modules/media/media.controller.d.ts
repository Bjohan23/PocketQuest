import { Response } from 'express';
import { MediaService } from './media.service';
import { MediaResponseDto } from './dto/media.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    upload(user: any, file: Express.Multer.File): Promise<MediaResponseDto>;
    download(user: any, id: string, res: Response): Promise<void>;
    getMetadata(user: any, id: string): Promise<MediaResponseDto>;
    delete(user: any, id: string): Promise<{
        message: string;
    }>;
}

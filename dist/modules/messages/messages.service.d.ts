import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SendMessageDto, MessageResponseDto, GetMessagesDto } from './dto/message.dto';
export declare class MessagesService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    send(userId: string, sendMessageDto: SendMessageDto): Promise<MessageResponseDto>;
    findAll(userId: string, chatId: string, getMessagesDto: GetMessagesDto): Promise<MessageResponseDto[]>;
    markDelivered(messageId: string): Promise<void>;
    findOne(messageId: string): Promise<MessageResponseDto>;
    deleteExpired(): Promise<number>;
    private toResponseDto;
}

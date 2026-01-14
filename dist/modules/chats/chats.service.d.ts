import { PrismaService } from '../../prisma/prisma.service';
import { CreateChatDto, AddParticipantDto, ChatResponseDto } from './dto/chat.dto';
export declare class ChatsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createChatDto: CreateChatDto): Promise<ChatResponseDto>;
    findAll(userId: string): Promise<ChatResponseDto[]>;
    findOne(userId: string, chatId: string): Promise<ChatResponseDto>;
    addParticipant(userId: string, chatId: string, addParticipantDto: AddParticipantDto): Promise<ChatResponseDto>;
    private findExisting1to1Chat;
    private toResponseDto;
}

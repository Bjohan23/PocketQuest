import { ChatsService } from './chats.service';
import { CreateChatDto, AddParticipantDto, ChatResponseDto } from './dto/chat.dto';
export declare class ChatsController {
    private readonly chatsService;
    constructor(chatsService: ChatsService);
    create(user: any, createChatDto: CreateChatDto): Promise<ChatResponseDto>;
    findAll(user: any): Promise<ChatResponseDto[]>;
    findOne(user: any, id: string): Promise<ChatResponseDto>;
    addParticipant(user: any, id: string, addParticipantDto: AddParticipantDto): Promise<ChatResponseDto>;
}

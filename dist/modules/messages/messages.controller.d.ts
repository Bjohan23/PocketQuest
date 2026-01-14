import { MessagesService } from './messages.service';
import { MessageResponseDto, GetMessagesDto } from './dto/message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getMessages(user: any, chatId: string, getMessagesDto: GetMessagesDto): Promise<MessageResponseDto[]>;
    markDelivered(id: string): Promise<{
        message: string;
    }>;
}

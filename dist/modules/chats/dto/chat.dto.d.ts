export declare class CreateChatDto {
    isGroup: boolean;
    participantIds: string[];
}
export declare class AddParticipantDto {
    userId: string;
}
export declare class ChatResponseDto {
    id: string;
    isGroup: boolean;
    createdAt: Date;
    participants: {
        id: string;
        identifier: string;
    }[];
}

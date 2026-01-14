import { PresenceService } from './presence.service';
export declare class PresenceController {
    private readonly presenceService;
    constructor(presenceService: PresenceService);
    getPresence(userId: string): Promise<{
        userId: string;
        isOnline: boolean;
    }>;
    getBatchPresence(body: {
        userIds: string[];
    }): Promise<Record<string, boolean>>;
    heartbeat(user: any): Promise<{
        message: string;
    }>;
}

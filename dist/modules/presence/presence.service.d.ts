import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class PresenceService {
    private readonly redis;
    private configService;
    private readonly presenceTtl;
    constructor(redis: Redis, configService: ConfigService);
    setOnline(userId: string): Promise<void>;
    setOffline(userId: string): Promise<void>;
    isOnline(userId: string): Promise<boolean>;
    getPresenceStatus(userIds: string[]): Promise<Record<string, boolean>>;
    refresh(userId: string): Promise<void>;
}

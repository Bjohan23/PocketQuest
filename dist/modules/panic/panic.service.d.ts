import { PrismaService } from '../../prisma/prisma.service';
import { DevicesService } from '../devices/devices.service';
import { MessagesGateway } from '../../gateways/messages.gateway';
import Redis from 'ioredis';
export declare class PanicService {
    private prisma;
    private devicesService;
    private messagesGateway;
    private readonly redis;
    constructor(prisma: PrismaService, devicesService: DevicesService, messagesGateway: MessagesGateway, redis: Redis);
    lockDevice(userId: string, deviceId: string): Promise<{
        message: string;
    }>;
    lockAllDevices(userId: string): Promise<{
        message: string;
        devicesLocked: number;
    }>;
    isDeviceBlocked(deviceId: string): Promise<boolean>;
}

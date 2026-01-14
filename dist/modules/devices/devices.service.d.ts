import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto, UpdateDeviceDto, DeviceResponseDto } from './dto/device.dto';
export declare class DevicesService {
    private prisma;
    constructor(prisma: PrismaService);
    register(userId: string, registerDeviceDto: RegisterDeviceDto): Promise<DeviceResponseDto>;
    findAll(userId: string): Promise<DeviceResponseDto[]>;
    update(userId: string, deviceId: string, updateDeviceDto: UpdateDeviceDto): Promise<DeviceResponseDto>;
    delete(userId: string, deviceId: string): Promise<void>;
    updateLastSeen(deviceId: string): Promise<void>;
    block(deviceId: string): Promise<void>;
    blockAll(userId: string): Promise<void>;
    private toResponseDto;
}

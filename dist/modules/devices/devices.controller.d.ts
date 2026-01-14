import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateDeviceDto, DeviceResponseDto } from './dto/device.dto';
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    register(user: any, registerDeviceDto: RegisterDeviceDto): Promise<DeviceResponseDto>;
    findAll(user: any): Promise<DeviceResponseDto[]>;
    update(user: any, id: string, updateDeviceDto: UpdateDeviceDto): Promise<DeviceResponseDto>;
    delete(user: any, id: string): Promise<{
        message: string;
    }>;
}

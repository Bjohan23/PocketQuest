import { PanicService } from './panic.service';
export declare class PanicController {
    private readonly panicService;
    constructor(panicService: PanicService);
    lockDevice(user: any, body: {
        deviceId: string;
    }): Promise<{
        message: string;
    }>;
    lockAllDevices(user: any): Promise<{
        message: string;
        devicesLocked: number;
    }>;
}

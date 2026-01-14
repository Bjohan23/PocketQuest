export declare class RegisterDeviceDto {
    deviceName: string;
    devicePublicKey: string;
    pushToken?: string;
}
export declare class UpdateDeviceDto {
    deviceName?: string;
    pushToken?: string;
}
export declare class DeviceResponseDto {
    id: string;
    userId: string;
    deviceName: string;
    devicePublicKey: string;
    pushToken: string | null;
    lastSeen: Date;
    isBlocked: boolean;
    createdAt: Date;
}

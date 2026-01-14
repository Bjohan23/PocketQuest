"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DevicesService = class DevicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(userId, registerDeviceDto) {
        const device = await this.prisma.device.create({
            data: {
                userId,
                ...registerDeviceDto,
            },
        });
        return this.toResponseDto(device);
    }
    async findAll(userId) {
        const devices = await this.prisma.device.findMany({
            where: { userId },
            orderBy: { lastSeen: 'desc' },
        });
        return devices.map(device => this.toResponseDto(device));
    }
    async update(userId, deviceId, updateDeviceDto) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, userId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Device not found');
        }
        const updated = await this.prisma.device.update({
            where: { id: deviceId },
            data: {
                ...updateDeviceDto,
                lastSeen: new Date(),
            },
        });
        return this.toResponseDto(updated);
    }
    async delete(userId, deviceId) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, userId },
        });
        if (!device) {
            throw new common_1.NotFoundException('Device not found');
        }
        await this.prisma.device.delete({
            where: { id: deviceId },
        });
    }
    async updateLastSeen(deviceId) {
        await this.prisma.device.update({
            where: { id: deviceId },
            data: { lastSeen: new Date() },
        });
    }
    async block(deviceId) {
        await this.prisma.device.update({
            where: { id: deviceId },
            data: { isBlocked: true },
        });
    }
    async blockAll(userId) {
        await this.prisma.device.updateMany({
            where: { userId },
            data: { isBlocked: true },
        });
    }
    toResponseDto(device) {
        return {
            id: device.id,
            userId: device.userId,
            deviceName: device.deviceName,
            devicePublicKey: device.devicePublicKey,
            pushToken: device.pushToken,
            lastSeen: device.lastSeen,
            isBlocked: device.isBlocked,
            createdAt: device.createdAt,
        };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map
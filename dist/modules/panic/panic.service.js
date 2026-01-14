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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const devices_service_1 = require("../devices/devices.service");
const messages_gateway_1 = require("../../gateways/messages.gateway");
const ioredis_1 = require("ioredis");
const redis_module_1 = require("../../config/redis.module");
let PanicService = class PanicService {
    constructor(prisma, devicesService, messagesGateway, redis) {
        this.prisma = prisma;
        this.devicesService = devicesService;
        this.messagesGateway = messagesGateway;
        this.redis = redis;
    }
    async lockDevice(userId, deviceId) {
        await this.devicesService.block(deviceId);
        await this.redis.setex(`blacklist:device:${deviceId}`, 7 * 24 * 60 * 60, 'blocked');
        await this.messagesGateway.disconnectUser(userId);
        return { message: 'Device locked successfully' };
    }
    async lockAllDevices(userId) {
        const devices = await this.devicesService.findAll(userId);
        await this.devicesService.blockAll(userId);
        for (const device of devices) {
            await this.redis.setex(`blacklist:device:${device.id}`, 7 * 24 * 60 * 60, 'blocked');
        }
        await this.messagesGateway.disconnectUser(userId);
        return {
            message: 'All devices locked successfully',
            devicesLocked: devices.length,
        };
    }
    async isDeviceBlocked(deviceId) {
        const blacklisted = await this.redis.get(`blacklist:device:${deviceId}`);
        if (blacklisted) {
            return true;
        }
        const device = await this.prisma.device.findUnique({
            where: { id: deviceId },
        });
        return device?.isBlocked || false;
    }
};
exports.PanicService = PanicService;
exports.PanicService = PanicService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        devices_service_1.DevicesService,
        messages_gateway_1.MessagesGateway,
        ioredis_1.default])
], PanicService);
//# sourceMappingURL=panic.service.js.map
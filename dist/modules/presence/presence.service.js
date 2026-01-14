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
exports.PresenceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
const redis_module_1 = require("../../config/redis.module");
let PresenceService = class PresenceService {
    constructor(redis, configService) {
        this.redis = redis;
        this.configService = configService;
        this.presenceTtl = this.configService.get('ttl.presenceTtlSeconds');
    }
    async setOnline(userId) {
        const key = `presence:${userId}`;
        await this.redis.setex(key, this.presenceTtl, 'online');
    }
    async setOffline(userId) {
        const key = `presence:${userId}`;
        await this.redis.del(key);
    }
    async isOnline(userId) {
        const key = `presence:${userId}`;
        const status = await this.redis.get(key);
        return status === 'online';
    }
    async getPresenceStatus(userIds) {
        const result = {};
        for (const userId of userIds) {
            result[userId] = await this.isOnline(userId);
        }
        return result;
    }
    async refresh(userId) {
        const key = `presence:${userId}`;
        const exists = await this.redis.exists(key);
        if (exists) {
            await this.redis.expire(key, this.presenceTtl);
        }
    }
};
exports.PresenceService = PresenceService;
exports.PresenceService = PresenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default,
        config_1.ConfigService])
], PresenceService);
//# sourceMappingURL=presence.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./config/redis.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const devices_module_1 = require("./modules/devices/devices.module");
const chats_module_1 = require("./modules/chats/chats.module");
const messages_module_1 = require("./modules/messages/messages.module");
const media_module_1 = require("./modules/media/media.module");
const presence_module_1 = require("./modules/presence/presence.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const panic_module_1 = require("./modules/panic/panic.module");
const cleanup_module_1 = require("./modules/cleanup/cleanup.module");
const gateways_module_1 = require("./gateways/gateways.module");
const configuration_1 = require("./config/configuration");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            devices_module_1.DevicesModule,
            chats_module_1.ChatsModule,
            messages_module_1.MessagesModule,
            media_module_1.MediaModule,
            presence_module_1.PresenceModule,
            notifications_module_1.NotificationsModule,
            panic_module_1.PanicModule,
            cleanup_module_1.CleanupModule,
            gateways_module_1.GatewaysModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
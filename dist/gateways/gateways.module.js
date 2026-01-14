"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewaysModule = void 0;
const common_1 = require("@nestjs/common");
const messages_gateway_1 = require("./messages.gateway");
const messages_module_1 = require("../modules/messages/messages.module");
const presence_module_1 = require("../modules/presence/presence.module");
const auth_module_1 = require("../modules/auth/auth.module");
let GatewaysModule = class GatewaysModule {
};
exports.GatewaysModule = GatewaysModule;
exports.GatewaysModule = GatewaysModule = __decorate([
    (0, common_1.Module)({
        imports: [messages_module_1.MessagesModule, presence_module_1.PresenceModule, auth_module_1.AuthModule],
        providers: [messages_gateway_1.MessagesGateway],
        exports: [messages_gateway_1.MessagesGateway],
    })
], GatewaysModule);
//# sourceMappingURL=gateways.module.js.map
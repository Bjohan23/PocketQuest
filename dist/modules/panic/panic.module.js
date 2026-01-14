"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanicModule = void 0;
const common_1 = require("@nestjs/common");
const panic_service_1 = require("./panic.service");
const panic_controller_1 = require("./panic.controller");
const devices_module_1 = require("../devices/devices.module");
const redis_module_1 = require("../../config/redis.module");
const gateways_module_1 = require("../../gateways/gateways.module");
let PanicModule = class PanicModule {
};
exports.PanicModule = PanicModule;
exports.PanicModule = PanicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            devices_module_1.DevicesModule,
            redis_module_1.RedisModule,
            (0, common_1.forwardRef)(() => gateways_module_1.GatewaysModule),
        ],
        controllers: [panic_controller_1.PanicController],
        providers: [panic_service_1.PanicService],
        exports: [panic_service_1.PanicService],
    })
], PanicModule);
//# sourceMappingURL=panic.module.js.map
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
exports.PanicController = void 0;
const common_1 = require("@nestjs/common");
const panic_service_1 = require("./panic.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PanicController = class PanicController {
    constructor(panicService) {
        this.panicService = panicService;
    }
    async lockDevice(user, body) {
        return this.panicService.lockDevice(user.id, body.deviceId);
    }
    async lockAllDevices(user) {
        return this.panicService.lockAllDevices(user.id);
    }
};
exports.PanicController = PanicController;
__decorate([
    (0, common_1.Post)('lock'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PanicController.prototype, "lockDevice", null);
__decorate([
    (0, common_1.Post)('lock-all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PanicController.prototype, "lockAllDevices", null);
exports.PanicController = PanicController = __decorate([
    (0, common_1.Controller)('panic'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [panic_service_1.PanicService])
], PanicController);
//# sourceMappingURL=panic.controller.js.map
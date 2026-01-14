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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { identifier, publicKey } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { identifier },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this identifier already exists');
        }
        const user = await this.prisma.user.create({
            data: {
                identifier,
                publicKey,
            },
        });
        return this.toResponseDto(user);
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.toResponseDto(user);
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
        return this.toResponseDto(user);
    }
    async search(query) {
        const users = await this.prisma.user.findMany({
            where: {
                identifier: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            take: 10,
        });
        return users.map(user => this.toResponseDto(user));
    }
    toResponseDto(user) {
        return {
            id: user.id,
            identifier: user.identifier,
            publicKey: user.publicKey,
            createdAt: user.createdAt,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    validateUser(userId: string): Promise<{
        identifier: string;
        id: string;
        publicKey: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    isDeviceBlocked(deviceId: string): Promise<boolean>;
}

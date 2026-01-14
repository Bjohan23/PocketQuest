import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    getMe(user: any): Promise<UserResponseDto>;
    updateMe(user: any, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    search(query: string): Promise<UserResponseDto[]>;
    getUser(id: string): Promise<UserResponseDto>;
}

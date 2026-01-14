export declare class CreateUserDto {
    identifier: string;
    publicKey: string;
}
export declare class UpdateUserDto {
    publicKey?: string;
}
export declare class UserResponseDto {
    id: string;
    identifier: string;
    publicKey: string;
    createdAt: Date;
}
export declare class SearchUserDto {
    query: string;
}

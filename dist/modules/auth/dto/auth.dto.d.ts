export declare class LoginDto {
    identifier: string;
    password: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        identifier: string;
        publicKey: string;
    };
}

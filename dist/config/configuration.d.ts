declare const _default: () => {
    port: number;
    nodeEnv: string;
    database: {
        url: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    media: {
        storagePath: string;
    };
    cors: {
        origin: string;
    };
    ttl: {
        defaultMessageTtlHours: number;
        cleanupIntervalMinutes: number;
        presenceTtlSeconds: number;
    };
};
export default _default;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRATION || '7d',
    },
    media: {
        storagePath: process.env.MEDIA_STORAGE_PATH || './data/media',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
    ttl: {
        defaultMessageTtlHours: parseInt(process.env.DEFAULT_MESSAGE_TTL_HOURS, 10) || 24,
        cleanupIntervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES, 10) || 5,
        presenceTtlSeconds: parseInt(process.env.PRESENCE_TTL_SECONDS, 10) || 300,
    },
});
//# sourceMappingURL=configuration.js.map
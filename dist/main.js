"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("./prisma/prisma.service");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port');
    const corsOrigin = configService.get('cors.origin');
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('PocketQuest API')
        .setDescription('Backend privado de mensajería con enfoque en privacidad. ' +
        'Este backend NO descifra mensajes, solo actúa como relay cifrado. ' +
        'Todo el cifrado E2EE ocurre en el cliente.')
        .setVersion('1.0')
        .addTag('auth', 'Autenticación JWT')
        .addTag('users', 'Gestión de usuarios')
        .addTag('devices', 'Administración de dispositivos')
        .addTag('chats', 'Chats individuales y grupos')
        .addTag('messages', 'Mensajes cifrados')
        .addTag('media', 'Archivos cifrados')
        .addTag('presence', 'Estado online/offline')
        .addTag('panic', 'Modo de emergencia')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'PocketQuest API Docs',
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    const prismaService = app.get(prisma_service_1.PrismaService);
    await prismaService.enableShutdownHooks(app);
    await app.listen(port);
    logger.log(`🚀 PocketQuest Backend running on: http://localhost:${port}/api`);
    logger.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
    logger.log(`🔒 Privacy-focused messaging backend`);
    logger.log(`📡 WebSocket Gateway enabled`);
}
bootstrap();
//# sourceMappingURL=main.js.map
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with WebSocket support
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('ProjectVoice API')
    .setDescription('REST API для ProjectVoice - голосового приложения с поддержкой WebRTC')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Users')
    .addTag('Servers')
    .addTag('Channels')
    .addTag('Messages')
    .addTag('ServerMembers')
    .addTag('Invites')
    .addTag('Friends')
    .addTag('Roles')
    .addTag('Admin')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerOptions = {
    customSiteTitle: 'ProjectVoice API',
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .html body { margin-top: 50px; }',
  };

  SwaggerModule.setup('api', app, document, swaggerOptions);
  
  await app.listen(5000);
}

bootstrap();

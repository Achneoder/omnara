import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      configService.get('CLIENT_URL', 'http://localhost:5173'),
      configService.get('DASHBOARD_URL', 'http://localhost:5174'),
    ],
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});

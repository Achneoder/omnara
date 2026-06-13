import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Apply security headers via helmet before any other middleware
  app.use(helmet());

  // Override the default Express body-parser limit (1mb) with a tighter bound
  app.useBodyParser('json', { limit: '100kb' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      configService.get('CLIENT_URL', 'http://localhost:5173'),
      configService.get('DASHBOARD_URL', 'http://localhost:5174'),
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});

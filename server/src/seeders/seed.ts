import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Migrator } from '@mikro-orm/migrations';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { PostgreSqlDriver, EntityManager } from '@mikro-orm/postgresql';
import { User } from '../modules/users/entities/user.entity.js';
import { RefreshToken } from '../modules/users/entities/refresh-token.entity.js';
import { InitialUserSeeder } from './initial-user.seeder.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot({
      driver: PostgreSqlDriver,
      host: process.env['DB_HOST'] ?? 'localhost',
      port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
      user: process.env['DB_USER'] ?? 'omnara',
      password: process.env['DB_PASSWORD'] ?? 'omnara',
      dbName: process.env['DB_NAME'] ?? 'omnara',
      entities: [User, RefreshToken],
      metadataProvider: ReflectMetadataProvider,
      extensions: [Migrator],
    }),
  ],
})
class SeedModule {}

async function runSeed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn'],
  });

  const em = app.get(EntityManager);
  const seeder = new InitialUserSeeder(em);

  try {
    await seeder.run();
  } finally {
    await app.close();
  }
}

runSeed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});

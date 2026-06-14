import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import * as path from 'path';

export default defineConfig({
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  user: process.env['DB_USER'] ?? 'omnara',
  password: process.env['DB_PASSWORD'] ?? 'omnara',
  dbName: process.env['DB_NAME'] ?? 'omnara',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  migrations: {
    path: path.join(__dirname, '..', 'migrations'),
    pathTs: path.join(__dirname, '..', 'migrations'),
    glob: '!(*.d).{js,ts}',
  },
  metadataProvider: ReflectMetadataProvider,
  extensions: [Migrator],
});

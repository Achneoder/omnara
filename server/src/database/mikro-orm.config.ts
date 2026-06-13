import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import * as path from 'path';
import * as url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  driver: undefined as never,
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  user: process.env['DB_USER'] ?? 'omnara',
  password: process.env['DB_PASSWORD'] ?? 'omnara',
  dbName: process.env['DB_NAME'] ?? 'omnara',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, '..', 'migrations'),
    pathTs: path.join(__dirname, '..', 'migrations'),
    glob: '!(*.d).{js,ts}',
  },
  extensions: [Migrator],
});

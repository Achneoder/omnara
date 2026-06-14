'use strict';

require('reflect-metadata');
require('dotenv').config();

const { defineConfig } = require('@mikro-orm/postgresql');
const { Migrator } = require('@mikro-orm/migrations');
const { ReflectMetadataProvider } = require('@mikro-orm/decorators/legacy');
const path = require('path');

module.exports = defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'omnara',
  password: process.env.DB_PASSWORD || 'omnara',
  dbName: process.env.DB_NAME || 'omnara',
  entities: ['dist/**/*.entity.js'],
  metadataProvider: ReflectMetadataProvider,
  migrations: {
    path: path.join(__dirname, 'dist/migrations'),
    glob: '*.js',
  },
  extensions: [Migrator],
});

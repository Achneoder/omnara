import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        user: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        dbName: configService.getOrThrow<string>('DB_NAME'),
        migrations: {
          path: 'dist/migrations',
          pathTs: 'src/migrations',
          glob: '!(*.d).{js,ts}',
        },
        metadataProvider: ReflectMetadataProvider,
        extensions: [Migrator],
        autoLoadEntities: true,
      }),
    }),
  ],
  exports: [],
})
export class DatabaseModule {}

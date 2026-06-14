import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';

@Module({
  imports: [MikroOrmModule.forFeature([User, RefreshToken])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

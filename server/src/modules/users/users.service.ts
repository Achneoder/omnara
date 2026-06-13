import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserRole } from './entities/user.entity.js';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email: email.toLowerCase() });
  }

  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  async create(data: CreateUserData): Promise<User> {
    const user = new User();
    user.email = data.email;
    user.passwordHash = data.passwordHash;
    user.role = data.role;
    this.em.persist(user);
    await this.em.flush();
    return user;
  }

  async updateFailedAttempts(user: User, count: number, lockedUntil: Date | null): Promise<void> {
    user.failedLoginAttempts = count;
    user.lockedUntil = lockedUntil;
    await this.em.flush();
  }
}

import { EntityManager } from '@mikro-orm/postgresql';
import type { RequiredEntityData } from '@mikro-orm/core';
import * as argon2 from 'argon2';
import { User, UserRole } from '../modules/users/entities/user.entity.js';

export class InitialUserSeeder {
  constructor(private readonly em: EntityManager) {}

  async run(): Promise<void> {
    const email = process.env['SEED_EMAIL'];
    const password = process.env['SEED_PASSWORD'];

    if (!email || !password) {
      throw new Error('SEED_EMAIL and SEED_PASSWORD environment variables are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.em.findOne(User, { email: normalizedEmail });

    if (existing) {
      console.log(`User ${normalizedEmail} already exists — skipping`);
      return;
    }

    const passwordHash = await argon2.hash(password);

    const user = this.em.create(User, {
      email: normalizedEmail,
      passwordHash,
      role: UserRole.ADMIN,
    } as RequiredEntityData<User>);

    await this.em.flush();

    console.log(`Created admin user: ${user.email} (id: ${user.id})`);
  }
}

import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  Index,
  BeforeCreate,
  BeforeUpdate,
  Enum,
} from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  @Unique()
  @Index()
  email!: string;

  @Property()
  passwordHash!: string;

  @Enum(() => UserRole)
  role!: UserRole;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: 0 })
  failedLoginAttempts: number = 0;

  @Property({ nullable: true, type: 'timestamptz' })
  lockedUntil: Date | null = null;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @BeforeCreate()
  @BeforeUpdate()
  normalizeEmail(): void {
    this.email = this.email.toLowerCase();
  }
}

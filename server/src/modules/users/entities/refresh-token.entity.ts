import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity.js';

@Entity({ tableName: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;

  @Property()
  tokenHash!: string;

  @Property({ type: 'uuid' })
  @Index()
  familyId!: string;

  @Property({ type: 'timestamptz' })
  expiresAt!: Date;

  @Property({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null = null;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();
}

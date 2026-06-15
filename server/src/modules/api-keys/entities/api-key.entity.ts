import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'api_keys' })
export class ApiKey {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ type: 'text' })
  keyHash!: string;

  @Property()
  label!: string;

  @Property({ nullable: true, type: 'timestamptz' })
  lastUsedAt: Date | null = null;

  @Property({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null = null;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';

export enum SitePlatform {
  WORDPRESS = 'wordpress',
  SHOPIFY = 'shopify',
  CUSTOM = 'custom',
}

@Entity({ tableName: 'sites' })
export class Site {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  name!: string;

  @Property()
  url!: string;

  @Enum(() => SitePlatform)
  platform!: SitePlatform;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  settings: Record<string, unknown> | null = {};

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

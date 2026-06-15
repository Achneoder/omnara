import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';

@Entity({ tableName: 'webhooks' })
export class Webhook {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Site, { fieldName: 'site_id', deleteRule: 'cascade' })
  @Index()
  site!: Site;

  @Property()
  url!: string;

  @Property()
  secret!: string;

  @Property({ type: 'jsonb', default: '[]' })
  eventTypes: string[] = [];

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

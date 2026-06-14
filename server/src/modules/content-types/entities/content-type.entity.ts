import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  Unique,
} from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';

@Entity({ tableName: 'content_types' })
// Unique constraint enforced at DB level via index in migration; decorator for ORM awareness
@Unique({ properties: ['site', 'slug'] })
export class ContentType {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Site, { fieldName: 'site_id', onDelete: 'cascade' })
  @Index()
  site!: Site;

  @Property()
  name!: string;

  @Property()
  slug!: string;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  fieldSchema: Record<string, unknown> | null = {};

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

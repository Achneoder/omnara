import { Entity, PrimaryKey, Property, ManyToOne, Index, Enum } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';
import { ContentType } from '../../content-types/entities/content-type.entity.js';

export enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  LIVE = 'live',
  ARCHIVED = 'archived',
}

@Entity({ tableName: 'content_entries' })
export class ContentEntry {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Site, { fieldName: 'site_id', deleteRule: 'cascade' })
  @Index()
  site!: Site;

  @ManyToOne(() => ContentType, { fieldName: 'content_type_id', deleteRule: 'restrict' })
  @Index()
  contentType!: ContentType;

  @Property()
  title!: string;

  @Property()
  slug!: string;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  body: Record<string, unknown> | null = {};

  @Enum(() => ContentStatus)
  @Index()
  status!: ContentStatus;

  @Property({ nullable: true, type: 'timestamptz' })
  publishedAt: Date | null = null;

  @Property({ type: 'text', nullable: true })
  authorSessionId: string | null = null;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

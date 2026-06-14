import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';

@Entity({ tableName: 'activity_logs' })
export class ActivityLog {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  // Nullable: activity may not be tied to a specific site (e.g. auth events)
  @ManyToOne(() => Site, { fieldName: 'site_id', nullable: true, onDelete: 'set null' })
  @Index()
  site: Site | null = null;

  @Property({ nullable: true })
  @Index()
  sessionId: string | null = null;

  @Property({ length: 255 })
  action!: string;

  @Property({ length: 100 })
  entityType!: string;

  // UUID of the affected entity, stored as string to accommodate cross-table references
  @Property({ nullable: true })
  entityId: string | null = null;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  metadata: Record<string, unknown> | null = {};

  @Property({ type: 'timestamptz' })
  @Index()
  createdAt: Date = new Date();
}

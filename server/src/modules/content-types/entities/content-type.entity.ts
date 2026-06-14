import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  Unique,
} from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';
import { ThemeComponent } from '../../themes/entities/theme-component.entity.js';

@Entity({ tableName: 'content_types' })
// Unique constraint enforced at DB level via index in migration; decorator for ORM awareness
@Unique({ properties: ['site', 'slug'] })
export class ContentType {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Site, { fieldName: 'site_id', deleteRule: 'cascade' })
  @Index()
  site!: Site;

  @Property()
  name!: string;

  @Property()
  slug!: string;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  fieldSchema: Record<string, unknown> | null = {};

  @ManyToOne(() => ThemeComponent, {
    fieldName: 'component_id',
    nullable: true,
    deleteRule: 'set null',
  })
  component: ThemeComponent | null = null;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  Unique,
} from '@mikro-orm/decorators/legacy';
import { Collection } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';
import { PageSection } from './page-section.entity.js';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity({ tableName: 'pages' })
@Unique({ properties: ['site', 'slug'] })
export class Page {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Site, { fieldName: 'site_id', deleteRule: 'cascade' })
  @Index()
  site!: Site;

  @Property()
  title!: string;

  @Property()
  slug!: string;

  @Property({ default: false })
  isHomepage: boolean = false;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  meta: Record<string, unknown> | null = {};

  @Property({ columnType: 'varchar(20)', default: PageStatus.DRAFT })
  status: string = PageStatus.DRAFT;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @OneToMany(() => PageSection, (s) => s.page)
  sections = new Collection<PageSection>(this);

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

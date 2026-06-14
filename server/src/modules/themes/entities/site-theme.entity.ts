import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  OneToMany,
  Index,
} from '@mikro-orm/decorators/legacy';
import { Collection } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';
import { ThemeComponent } from './theme-component.entity.js';

@Entity({ tableName: 'site_themes' })
export class SiteTheme {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @OneToOne(() => Site, { fieldName: 'site_id', deleteRule: 'cascade', unique: true })
  @Index()
  site!: Site;

  @Property()
  name!: string;

  @Property()
  version!: string;

  // Flat map: { "--color-primary": "#ff0000", "--font-sans": "Inter, sans-serif", ... }
  @Property({ type: 'jsonb', default: '{}' })
  tokens: Record<string, string> = {};

  // Raw CSS injected after tokens. Sanitized on write.
  @Property({ columnType: 'text', nullable: true })
  rawCss: string | null = null;

  @OneToMany(() => ThemeComponent, (c) => c.theme)
  components = new Collection<ThemeComponent>(this);

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

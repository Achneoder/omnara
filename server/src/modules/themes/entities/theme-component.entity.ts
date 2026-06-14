import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
  Index,
  Unique,
} from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { SiteTheme } from './site-theme.entity.js';

export enum ComponentCategory {
  LAYOUT = 'layout',
  HERO = 'hero',
  CARD = 'card',
  ARTICLE = 'article',
  PRODUCT = 'product',
  MEDIA = 'media',
  CTA = 'cta',
  NAV = 'nav',
  FOOTER = 'footer',
  MISC = 'misc',
}

@Entity({ tableName: 'theme_components' })
@Unique({ properties: ['theme', 'slug'] })
export class ThemeComponent {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => SiteTheme, { fieldName: 'theme_id', deleteRule: 'cascade' })
  @Index()
  theme!: SiteTheme;

  @Property()
  name!: string;

  @Property()
  slug!: string;

  @Enum(() => ComponentCategory)
  category!: ComponentCategory;

  // HTML with {{placeholder}} syntax resolved via propsSchema
  @Property({ columnType: 'text' })
  template!: string;

  // Scoped CSS — client wraps in [data-component="slug"] { ... }
  @Property({ columnType: 'text', nullable: true })
  css: string | null = null;

  // Maps template placeholder names → ContentEntry.body keys
  @Property({ type: 'jsonb', default: '{}' })
  propsSchema: Record<string, string> = {};

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

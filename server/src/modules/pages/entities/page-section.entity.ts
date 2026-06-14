import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { Page } from './page.entity.js';
import { ThemeComponent } from '../../themes/entities/theme-component.entity.js';

@Entity({ tableName: 'page_sections' })
export class PageSection {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Page, { fieldName: 'page_id', deleteRule: 'cascade' })
  @Index()
  page!: Page;

  @ManyToOne(() => ThemeComponent, {
    fieldName: 'component_id',
    deleteRule: 'restrict',
  })
  @Index()
  component!: ThemeComponent;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  props: Record<string, unknown> | null = {};

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

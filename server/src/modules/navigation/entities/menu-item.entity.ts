import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';

@Entity({ tableName: 'menu_items' })
export class MenuItem {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Site, { fieldName: 'site_id', deleteRule: 'cascade' })
  @Index()
  site!: Site;

  @Property()
  label!: string;

  @Property({ columnType: 'varchar(2048)' })
  url!: string;

  // Self-referencing: parent menu item for nested menus
  @ManyToOne(() => MenuItem, {
    fieldName: 'parent_id',
    nullable: true,
    deleteRule: 'cascade',
  })
  @Index()
  parent: MenuItem | null = null;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ columnType: 'varchar(50)', default: 'header' })
  menuName: string = 'header';

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

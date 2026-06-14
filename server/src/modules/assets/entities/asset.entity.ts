import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { Site } from '../../sites/entities/site.entity.js';

export enum AssetCategory {
  IMAGE = 'image',
  FONT = 'font',
  FAVICON = 'favicon',
  OTHER = 'other',
}

@Entity({ tableName: 'assets' })
export class Asset {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Site, { fieldName: 'site_id', deleteRule: 'cascade' })
  @Index()
  site!: Site;

  @Property({ columnType: 'varchar(500)' })
  originalName!: string;

  @Property({ columnType: 'varchar(1000)' })
  storagePath!: string;

  @Property({ columnType: 'varchar(255)' })
  mimeType!: string;

  @Property({ columnType: 'bigint', default: 0 })
  size: number = 0;

  @Property({ columnType: 'varchar(20)', default: AssetCategory.OTHER })
  category: string = AssetCategory.OTHER;

  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  variants: Record<string, unknown> | null = {};

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

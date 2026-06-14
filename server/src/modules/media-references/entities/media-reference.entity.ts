import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { ContentEntry } from '../../content-entries/entities/content-entry.entity.js';

@Entity({ tableName: 'media_references' })
export class MediaReference {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => ContentEntry, { fieldName: 'content_entry_id', onDelete: 'cascade' })
  @Index()
  contentEntry!: ContentEntry;

  @Property({ type: 'text' })
  url!: string;

  @Property({ nullable: true })
  altText: string | null = null;

  @Property()
  mimeType!: string;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

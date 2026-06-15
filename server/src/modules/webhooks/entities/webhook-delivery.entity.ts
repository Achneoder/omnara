import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/decorators/legacy';
import { v4 as uuidv4 } from 'uuid';
import { Webhook } from './webhook.entity.js';

@Entity({ tableName: 'webhook_deliveries' })
export class WebhookDelivery {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Webhook, { fieldName: 'webhook_id', deleteRule: 'cascade' })
  @Index()
  webhook!: Webhook;

  @Property()
  event!: string;

  @Property({ type: 'jsonb' })
  payload: Record<string, unknown> = {};

  @Property({ nullable: true })
  statusCode: number | null = null;

  @Property({ type: 'text', nullable: true })
  responseBody: string | null = null;

  @Property({ default: 0 })
  attempts: number = 0;

  @Property({ default: false })
  success: boolean = false;

  @Property({ type: 'timestamptz', nullable: true })
  deliveredAt: Date | null = null;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();
}

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EntityManager } from '@mikro-orm/postgresql';
import { createHmac, randomBytes } from 'node:crypto';
import { Webhook } from './entities/webhook.entity.js';
import { WebhookDelivery } from './entities/webhook-delivery.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';
import { UpdateWebhookDto } from './dto/update-webhook.dto.js';

export interface WebhookEvent {
  siteId: string;
  event: string;
  payload: Record<string, unknown>;
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [0, 5_000, 30_000];

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly em: EntityManager) {}

  async findAll(siteId: string): Promise<Webhook[]> {
    return this.em.find(Webhook, { site: { id: siteId } }, { orderBy: { createdAt: 'DESC' } });
  }

  async findOne(id: string, siteId: string): Promise<Webhook> {
    const webhook = await this.em.findOne(Webhook, { id, site: { id: siteId } });
    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found`);
    }
    return webhook;
  }

  async create(
    siteId: string,
    dto: CreateWebhookDto,
  ): Promise<Webhook & { plaintextSecret: string }> {
    const site = await this.em.findOne(Site, { id: siteId });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    const plaintextSecret = randomBytes(32).toString('hex');

    const webhook = new Webhook();
    webhook.site = site;
    webhook.url = dto.url;
    webhook.secret = plaintextSecret;
    webhook.eventTypes = dto.eventTypes;
    if (dto.isActive !== undefined) webhook.isActive = dto.isActive;

    this.em.persist(webhook);
    await this.em.flush();

    return Object.assign(webhook, { plaintextSecret });
  }

  async update(id: string, siteId: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.findOne(id, siteId);
    if (dto.url !== undefined) webhook.url = dto.url;
    if (dto.eventTypes !== undefined) webhook.eventTypes = dto.eventTypes;
    if (dto.isActive !== undefined) webhook.isActive = dto.isActive;
    await this.em.flush();
    return webhook;
  }

  async remove(id: string, siteId: string): Promise<void> {
    const webhook = await this.findOne(id, siteId);
    this.em.remove(webhook);
    await this.em.flush();
  }

  async listDeliveries(webhookId: string, siteId: string): Promise<WebhookDelivery[]> {
    await this.findOne(webhookId, siteId);
    return this.em.find(
      WebhookDelivery,
      { webhook: { id: webhookId } },
      { orderBy: { createdAt: 'DESC' }, limit: 50 },
    );
  }

  @OnEvent('webhook.*', { async: true })
  async handleWebhookEvent(data: WebhookEvent): Promise<void> {
    const webhooks = await this.em.fork().find(Webhook, {
      site: { id: data.siteId },
      isActive: true,
    });

    const matching = webhooks.filter((w) => w.eventTypes.includes(data.event));
    for (const webhook of matching) {
      this.deliverWithRetry(webhook, data).catch(() => {
        // Delivery failures must not surface
      });
    }
  }

  private async deliverWithRetry(webhook: Webhook, data: WebhookEvent): Promise<void> {
    const delivery = new WebhookDelivery();
    delivery.webhook = webhook;
    delivery.event = data.event;
    delivery.payload = data.payload;

    const em = this.em.fork();
    em.persist(delivery);
    await em.flush();

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        await sleep(RETRY_DELAYS_MS[attempt]);
      }

      delivery.attempts = attempt + 1;

      try {
        const body = JSON.stringify({ event: data.event, payload: data.payload });
        const signature = sign(body, webhook.secret);

        const res = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Omnara-Event': data.event,
            'X-Omnara-Signature': signature,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });

        delivery.statusCode = res.status;
        delivery.responseBody = (await res.text()).slice(0, 1_000);
        delivery.success = res.ok;
        delivery.deliveredAt = new Date();

        await em.flush();

        if (res.ok) return;
      } catch (error) {
        this.logger.warn(`Webhook ${webhook.id} attempt ${attempt + 1} failed: ${String(error)}`);
        delivery.responseBody = String(error).slice(0, 1_000);
        await em.flush();
      }
    }
  }
}

function sign(body: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

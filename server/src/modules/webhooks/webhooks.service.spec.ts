import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager } from '@mikro-orm/postgresql';
import { WebhooksService } from './webhooks.service.js';
import { Webhook } from './entities/webhook.entity.js';
import { WebhookDelivery } from './entities/webhook-delivery.entity.js';
import { Site } from '../sites/entities/site.entity.js';

const mockFork = {
  find: jest.fn(),
  findOne: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
  remove: jest.fn(),
};

const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
  remove: jest.fn(),
  fork: jest.fn(() => mockFork),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  describe('findAll', () => {
    it('returns webhooks for the site', async () => {
      const webhooks = [{ id: 'wh-1' }] as Webhook[];
      mockEntityManager.find.mockResolvedValueOnce(webhooks);

      const result = await service.findAll('site-1');

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        Webhook,
        { site: { id: 'site-1' } },
        expect.any(Object),
      );
      expect(result).toBe(webhooks);
    });
  });

  describe('findOne', () => {
    it('returns webhook when found', async () => {
      const webhook = { id: 'wh-1' } as Webhook;
      mockEntityManager.findOne.mockResolvedValueOnce(webhook);

      const result = await service.findOne('wh-1', 'site-1');

      expect(result).toBe(webhook);
    });

    it('throws NotFoundException when not found', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('missing', 'site-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a webhook with a generated secret', async () => {
      const site = { id: 'site-1' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);
      mockEntityManager.persist.mockReturnValue(undefined);
      mockEntityManager.flush.mockResolvedValue(undefined);

      const result = await service.create('site-1', {
        url: 'https://example.com/hook',
        eventTypes: ['entry.published'],
      });

      expect(result.url).toBe('https://example.com/hook');
      expect(result.eventTypes).toEqual(['entry.published']);
      expect(result.plaintextSecret).toBeDefined();
      expect(result.plaintextSecret).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when site does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create('no-site', {
          url: 'https://example.com/hook',
          eventTypes: ['entry.created'],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates webhook fields', async () => {
      const webhook = {
        id: 'wh-1',
        url: 'https://old.com/hook',
        eventTypes: ['entry.created'],
        isActive: true,
      } as Webhook;
      mockEntityManager.findOne.mockResolvedValueOnce(webhook);
      mockEntityManager.flush.mockResolvedValue(undefined);

      const result = await service.update('wh-1', 'site-1', {
        url: 'https://new.com/hook',
        isActive: false,
      });

      expect(result.url).toBe('https://new.com/hook');
      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('removes the webhook', async () => {
      const webhook = { id: 'wh-1' } as Webhook;
      mockEntityManager.findOne.mockResolvedValueOnce(webhook);
      mockEntityManager.remove.mockReturnValue(undefined);
      mockEntityManager.flush.mockResolvedValue(undefined);

      await service.remove('wh-1', 'site-1');

      expect(mockEntityManager.remove).toHaveBeenCalledWith(webhook);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });
  });

  describe('listDeliveries', () => {
    it('returns deliveries for the webhook', async () => {
      const webhook = { id: 'wh-1' } as Webhook;
      const deliveries = [{ id: 'del-1' }] as WebhookDelivery[];
      mockEntityManager.findOne.mockResolvedValueOnce(webhook);
      mockEntityManager.find.mockResolvedValueOnce(deliveries);

      const result = await service.listDeliveries('wh-1', 'site-1');

      expect(result).toBe(deliveries);
    });
  });

  describe('handleWebhookEvent', () => {
    it('skips delivery when no matching webhooks', async () => {
      mockFork.find.mockResolvedValueOnce([]);

      await service.handleWebhookEvent({
        siteId: 'site-1',
        event: 'entry.published',
        payload: { id: 'e-1' },
      });

      // No delivery attempted
      expect(mockFork.persist).not.toHaveBeenCalled();
    });

    it('skips webhook when event type does not match', async () => {
      const webhook = {
        id: 'wh-1',
        eventTypes: ['entry.created'],
        url: 'https://example.com/hook',
        secret: 'secret',
      } as Webhook;
      mockFork.find.mockResolvedValueOnce([webhook]);

      await service.handleWebhookEvent({
        siteId: 'site-1',
        event: 'entry.published',
        payload: { id: 'e-1' },
      });

      expect(mockFork.persist).not.toHaveBeenCalled();
    });
  });
});

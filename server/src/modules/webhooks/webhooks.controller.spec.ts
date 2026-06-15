import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';
import { Webhook } from './entities/webhook.entity.js';
import { WebhookDelivery } from './entities/webhook-delivery.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

const mockWebhooksService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  listDeliveries: jest.fn(),
};

describe('WebhooksController', () => {
  let controller: WebhooksController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WebhooksService, useValue: mockWebhooksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  describe('findAll', () => {
    it('delegates to service with siteId', async () => {
      const webhooks = [{ id: 'wh-1' }] as Webhook[];
      mockWebhooksService.findAll.mockResolvedValueOnce(webhooks);

      const result = await controller.findAll('site-1');

      expect(mockWebhooksService.findAll).toHaveBeenCalledWith('site-1');
      expect(result).toBe(webhooks);
    });
  });

  describe('create', () => {
    it('delegates to service and returns webhook with secret', async () => {
      const webhook = { id: 'wh-1', plaintextSecret: 'abc123' } as Webhook & {
        plaintextSecret: string;
      };
      mockWebhooksService.create.mockResolvedValueOnce(webhook);

      const result = await controller.create('site-1', {
        url: 'https://example.com/hook',
        eventTypes: ['entry.published'],
      });

      expect(result).toBe(webhook);
    });
  });

  describe('findOne', () => {
    it('returns the webhook', async () => {
      const webhook = { id: 'wh-1' } as Webhook;
      mockWebhooksService.findOne.mockResolvedValueOnce(webhook);

      const result = await controller.findOne('site-1', 'wh-1');

      expect(mockWebhooksService.findOne).toHaveBeenCalledWith('wh-1', 'site-1');
      expect(result).toBe(webhook);
    });

    it('propagates NotFoundException', async () => {
      mockWebhooksService.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findOne('site-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('delegates update to service', async () => {
      const webhook = { id: 'wh-1', isActive: false } as Webhook;
      mockWebhooksService.update.mockResolvedValueOnce(webhook);

      const result = await controller.update('site-1', 'wh-1', { isActive: false });

      expect(mockWebhooksService.update).toHaveBeenCalledWith('wh-1', 'site-1', {
        isActive: false,
      });
      expect(result).toBe(webhook);
    });
  });

  describe('remove', () => {
    it('delegates remove to service', async () => {
      mockWebhooksService.remove.mockResolvedValueOnce(undefined);

      await controller.remove('site-1', 'wh-1');

      expect(mockWebhooksService.remove).toHaveBeenCalledWith('wh-1', 'site-1');
    });
  });

  describe('listDeliveries', () => {
    it('returns delivery history', async () => {
      const deliveries = [{ id: 'del-1' }] as WebhookDelivery[];
      mockWebhooksService.listDeliveries.mockResolvedValueOnce(deliveries);

      const result = await controller.listDeliveries('site-1', 'wh-1');

      expect(mockWebhooksService.listDeliveries).toHaveBeenCalledWith('wh-1', 'site-1');
      expect(result).toBe(deliveries);
    });
  });
});

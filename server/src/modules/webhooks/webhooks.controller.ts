import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { WebhooksService } from './webhooks.service.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';
import { UpdateWebhookDto } from './dto/update-webhook.dto.js';
import { Webhook } from './entities/webhook.entity.js';
import { WebhookDelivery } from './entities/webhook-delivery.entity.js';

@Controller('sites/:siteId/webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  findAll(@Param('siteId') siteId: string): Promise<Webhook[]> {
    return this.webhooksService.findAll(siteId);
  }

  @Post()
  create(
    @Param('siteId') siteId: string,
    @Body() dto: CreateWebhookDto,
  ): Promise<Webhook & { plaintextSecret: string }> {
    return this.webhooksService.create(siteId, dto);
  }

  @Get(':id')
  findOne(@Param('siteId') siteId: string, @Param('id') id: string): Promise<Webhook> {
    return this.webhooksService.findOne(id, siteId);
  }

  @Patch(':id')
  update(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ): Promise<Webhook> {
    return this.webhooksService.update(id, siteId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('siteId') siteId: string, @Param('id') id: string): Promise<void> {
    return this.webhooksService.remove(id, siteId);
  }

  @Get(':id/deliveries')
  listDeliveries(
    @Param('siteId') siteId: string,
    @Param('id') id: string,
  ): Promise<WebhookDelivery[]> {
    return this.webhooksService.listDeliveries(id, siteId);
  }
}

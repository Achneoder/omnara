import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { McpService } from './mcp.service.js';

@Controller('mcp')
@UseGuards(ApiKeyGuard)
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get('sse')
  @SkipThrottle()
  async handleSse(@Req() req: Request, @Res() res: Response): Promise<void> {
    const transport = new SSEServerTransport('/mcp/messages', res);
    const server = this.mcpService.createServer();

    this.mcpService.trackSession(transport.sessionId, server, transport);

    try {
      await server.connect(transport);
    } catch (e) {
      this.mcpService.removeSession(transport.sessionId);
      throw e;
    }

    req.on('close', () => {
      this.mcpService.removeSession(transport.sessionId);
    });
  }

  @Post('messages')
  @HttpCode(HttpStatus.OK)
  async handleMessages(
    @Query('sessionId') sessionId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!sessionId) {
      throw new BadRequestException('sessionId query parameter is required');
    }

    const transport = this.mcpService.getTransport(sessionId);

    if (!transport) {
      throw new NotFoundException(`MCP session not found: ${sessionId}`);
    }

    await transport.handlePostMessage(req, res, req.body);
  }
}

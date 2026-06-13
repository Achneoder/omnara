import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { McpService } from './mcp.service.js';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get('sse')
  async handleSse(@Req() req: Request, @Res() res: Response): Promise<void> {
    const transport = new SSEServerTransport('/mcp/messages', res);
    const server = this.mcpService.createServer();

    this.mcpService.trackSession(transport.sessionId, server, transport);

    await server.connect(transport);

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
    const transport = this.mcpService.getTransport(sessionId);

    if (!transport) {
      throw new NotFoundException(`MCP session not found: ${sessionId}`);
    }

    await transport.handlePostMessage(req, res, req.body);
  }
}

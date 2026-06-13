import { Module } from '@nestjs/common';
import { McpService } from './mcp.service.js';
import { McpController } from './mcp.controller.js';

@Module({
  providers: [McpService],
  controllers: [McpController],
  exports: [McpService],
})
export class McpModule {}

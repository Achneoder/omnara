import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

interface McpSession {
  server: McpServer;
  transport: SSEServerTransport;
}

@Injectable()
export class McpService implements OnApplicationShutdown {
  private readonly logger = new Logger(McpService.name);
  private readonly sessions = new Map<string, McpSession>();

  createServer(): McpServer {
    const server = new McpServer({
      name: 'omnara',
      version: '1.0.0',
    });

    this.registerCapabilities(server);

    return server;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private registerCapabilities(_server: McpServer): void {
    // Register tools, resources, and prompts here as the app grows.
    // Example:
    // server.tool(
    //   'list-content',
    //   'List all content items',
    //   z.object({ limit: z.number().optional() }),
    //   async ({ limit }) => ({ content: [{ type: 'text', text: JSON.stringify([]) }] }),
    // );
  }

  trackSession(sessionId: string, server: McpServer, transport: SSEServerTransport): void {
    this.sessions.set(sessionId, { server, transport });
    this.logger.debug(`Session started: ${sessionId} (total: ${this.sessions.size})`);
  }

  getTransport(sessionId: string): SSEServerTransport | undefined {
    return this.sessions.get(sessionId)?.transport;
  }

  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.debug(`Session ended: ${sessionId} (total: ${this.sessions.size})`);
  }

  async onApplicationShutdown(): Promise<void> {
    for (const [sessionId, { server }] of this.sessions) {
      await server.close();
      this.logger.debug(`Closed session: ${sessionId}`);
    }
    this.sessions.clear();
  }
}

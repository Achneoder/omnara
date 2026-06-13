import { Test, TestingModule } from '@nestjs/testing';
import { McpService } from './mcp.service.js';

describe('McpService', () => {
  let service: McpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpService],
    }).compile();

    service = module.get<McpService>(McpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new McpServer instance', () => {
    const server = service.createServer();
    expect(server).toBeDefined();
  });

  it('should track and retrieve a session transport', () => {
    const mockTransport = { sessionId: 'test-session-id' } as never;
    const mockServer = {} as never;

    service.trackSession('test-session-id', mockServer, mockTransport);

    expect(service.getTransport('test-session-id')).toBe(mockTransport);
  });

  it('should remove a session', () => {
    const mockTransport = { sessionId: 'to-remove' } as never;
    const mockServer = {} as never;

    service.trackSession('to-remove', mockServer, mockTransport);
    service.removeSession('to-remove');

    expect(service.getTransport('to-remove')).toBeUndefined();
  });
});

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard.js';

function makeContext(headers: Record<string, string | undefined>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

function makeGuard(mcpApiKey: string | undefined): ApiKeyGuard {
  const configService = {
    get: jest.fn().mockReturnValue(mcpApiKey),
  } as unknown as ConfigService;
  return new ApiKeyGuard(configService);
}

describe('ApiKeyGuard', () => {
  it('allows all requests when MCP_API_KEY is not configured', () => {
    const guard = makeGuard(undefined);
    const ctx = makeContext({});
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows requests with the correct x-api-key header', () => {
    const guard = makeGuard('secret-key');
    const ctx = makeContext({ 'x-api-key': 'secret-key' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws UnauthorizedException when the x-api-key header is missing', () => {
    const guard = makeGuard('secret-key');
    const ctx = makeContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the x-api-key header does not match', () => {
    const guard = makeGuard('secret-key');
    const ctx = makeContext({ 'x-api-key': 'wrong-key' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when x-api-key is an empty string', () => {
    const guard = makeGuard('secret-key');
    const ctx = makeContext({ 'x-api-key': '' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});

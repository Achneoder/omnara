import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard.js';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service.js';
import type { ApiKey } from '../../modules/api-keys/entities/api-key.entity.js';
import type { Site } from '../../modules/sites/entities/site.entity.js';

function makeContext(headers: Record<string, string | undefined>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

function makeGuard(mcpApiKey: string | undefined, validateKeyResult: ApiKey | null): ApiKeyGuard {
  const configService = {
    get: jest.fn().mockReturnValue(mcpApiKey),
  } as unknown as ConfigService;

  const apiKeysService = {
    validateKey: jest.fn().mockResolvedValue(validateKeyResult),
  } as unknown as ApiKeysService;

  return new ApiKeyGuard(configService, apiKeysService);
}

const mockApiKey = {
  id: 'key-1',
  site: { id: 'site-1' } as Site,
} as ApiKey;

describe('ApiKeyGuard', () => {
  it('allows requests when DB key matches and attaches apiKey to request', async () => {
    const guard = makeGuard(undefined, mockApiKey);
    const request = { headers: { 'x-api-key': 'omk_validkey' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect((request as Record<string, unknown>)['apiKey']).toBe(mockApiKey);
  });

  it('falls back to env key when no DB key matches and env key is correct', async () => {
    const guard = makeGuard('env-secret', null);
    const ctx = makeContext({ 'x-api-key': 'env-secret' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws UnauthorizedException when no DB key matches and env key does not match', async () => {
    const guard = makeGuard('env-secret', null);
    const ctx = makeContext({ 'x-api-key': 'wrong-key' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when no DB key matches and no env key is configured', async () => {
    const guard = makeGuard(undefined, null);
    const ctx = makeContext({ 'x-api-key': 'some-key' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the x-api-key header is missing', async () => {
    const guard = makeGuard(undefined, null);
    const ctx = makeContext({});

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when x-api-key is an empty string', async () => {
    const guard = makeGuard('env-secret', null);
    const ctx = makeContext({ 'x-api-key': '' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});

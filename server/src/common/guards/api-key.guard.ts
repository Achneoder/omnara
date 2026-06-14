import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service.js';
import type { ApiKey } from '../../modules/api-keys/entities/api-key.entity.js';

export interface AuthenticatedRequest extends Request {
  apiKey: ApiKey;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'];

    if (!providedKey || typeof providedKey !== 'string') {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    const matched = await this.apiKeysService.validateKey(providedKey);

    if (matched) {
      (request as AuthenticatedRequest).apiKey = matched;
      return true;
    }

    // Dev fallback: honour MCP_API_KEY env var when no DB keys match.
    // This only applies when no DB key matched — intentionally not a primary path.
    const envKey = this.configService.get<string>('MCP_API_KEY');
    if (envKey && providedKey === envKey) {
      return true;
    }

    throw new UnauthorizedException('Invalid or missing API key');
  }
}

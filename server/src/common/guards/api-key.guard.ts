import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredKey = this.configService.get<string>('MCP_API_KEY');

    // No key configured — allow all requests (dev-friendly default)
    if (!requiredKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'];

    if (!providedKey || providedKey !== requiredKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}

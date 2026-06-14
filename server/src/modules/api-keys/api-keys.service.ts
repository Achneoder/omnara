import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { ApiKey } from './entities/api-key.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { ApiKeyResponseDto } from './dto/api-key-response.dto.js';

@Injectable()
export class ApiKeysService {
  constructor(private readonly em: EntityManager) {}

  async generate(siteId: string, dto: CreateApiKeyDto): Promise<ApiKeyResponseDto> {
    const site = await this.em.findOne(Site, { id: siteId });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    const rawKey = `omk_${randomBytes(32).toString('hex')}`;
    const keyHash = await argon2.hash(rawKey);

    const apiKey = new ApiKey();
    apiKey.label = dto.label;
    apiKey.site = site;
    apiKey.keyHash = keyHash;

    this.em.persist(apiKey);
    await this.em.flush();

    return {
      id: apiKey.id,
      label: apiKey.label,
      siteId: site.id,
      lastUsedAt: apiKey.lastUsedAt,
      revokedAt: apiKey.revokedAt,
      createdAt: apiKey.createdAt,
      key: rawKey,
    };
  }

  async findBySite(siteId: string): Promise<ApiKeyResponseDto[]> {
    const keys = await this.em.find(ApiKey, {
      site: { id: siteId },
      revokedAt: null,
    });

    return keys.map((key) => ({
      id: key.id,
      label: key.label,
      siteId,
      lastUsedAt: key.lastUsedAt,
      revokedAt: key.revokedAt,
      createdAt: key.createdAt,
    }));
  }

  async revoke(id: string): Promise<void> {
    const key = await this.em.findOne(ApiKey, { id });
    if (!key) {
      throw new NotFoundException(`API key ${id} not found`);
    }
    key.revokedAt = new Date();
    await this.em.flush();
  }

  /**
   * Validates a raw API key against all non-revoked keys in the database.
   * Returns the matching ApiKey entity (with site populated) or null if no match.
   *
   * Uses argon2 verification so this involves a hash comparison per key.
   * Callers should update lastUsedAt on the returned key after a successful match.
   */
  async validateKey(rawKey: string): Promise<ApiKey | null> {
    const candidates = await this.em.find(ApiKey, { revokedAt: null }, { populate: ['site'] });

    for (const candidate of candidates) {
      const matches = await argon2.verify(candidate.keyHash, rawKey);
      if (matches) {
        candidate.lastUsedAt = new Date();
        await this.em.flush();
        return candidate;
      }
    }

    return null;
  }
}

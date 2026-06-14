import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ApiKeysService } from './api-keys.service.js';
import { ApiKey } from './entities/api-key.entity.js';
import { Site } from '../sites/entities/site.entity.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-key'),
}));

const mockEntityManager = {
  findOne: jest.fn(),
  find: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
};

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeysService, { provide: EntityManager, useValue: mockEntityManager }],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
  });

  describe('generate', () => {
    it('returns response with plainTextKey and never exposes keyHash', async () => {
      const site = { id: 'site-1', name: 'Test Site' } as Site;
      mockEntityManager.findOne.mockResolvedValueOnce(site);
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: CreateApiKeyDto = { label: 'My Key', siteId: 'site-1' };
      const result = await service.generate(dto);

      expect(result.plainTextKey).toMatch(/^omk_[0-9a-f]{64}$/);
      expect(result.label).toBe('My Key');
      expect(result.siteId).toBe('site-1');
      expect(result.revokedAt).toBeNull();
      expect('keyHash' in result).toBe(false);
      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when site does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.generate({ label: 'Key', siteId: 'missing-site' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySite', () => {
    it('returns non-revoked keys mapped to response DTOs without keyHash', async () => {
      const keys = [
        {
          id: 'key-1',
          label: 'Key 1',
          lastUsedAt: null,
          revokedAt: null,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'key-2',
          label: 'Key 2',
          lastUsedAt: new Date('2024-06-01'),
          revokedAt: null,
          createdAt: new Date('2024-01-02'),
        },
      ] as ApiKey[];
      mockEntityManager.find.mockResolvedValueOnce(keys);

      const result = await service.findBySite('site-1');

      expect(mockEntityManager.find).toHaveBeenCalledWith(ApiKey, {
        site: { id: 'site-1' },
        revokedAt: null,
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('key-1');
      expect(result[1].id).toBe('key-2');
      result.forEach((r) => {
        expect('keyHash' in r).toBe(false);
        expect('plainTextKey' in r).toBe(false);
      });
    });
  });

  describe('revoke', () => {
    it('sets revokedAt on the key and flushes', async () => {
      const key = { id: 'key-1', revokedAt: null } as ApiKey;
      mockEntityManager.findOne.mockResolvedValueOnce(key);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.revoke('key-1');

      expect(key.revokedAt).toBeInstanceOf(Date);
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('throws NotFoundException when key does not exist', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.revoke('missing-key')).rejects.toThrow(NotFoundException);
    });
  });
});

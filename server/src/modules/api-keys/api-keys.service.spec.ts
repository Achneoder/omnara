import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import * as argon2 from 'argon2';
import { ApiKeysService } from './api-keys.service.js';
import { ApiKey } from './entities/api-key.entity.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-key'),
  verify: jest.fn(),
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
    it('returns response with key and never exposes keyHash', async () => {
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const dto: CreateApiKeyDto = { label: 'My Key' };
      const result = await service.generate(dto);

      expect(result.key).toMatch(/^omk_[0-9a-f]{64}$/);
      expect(result.label).toBe('My Key');
      expect(result.revokedAt).toBeNull();
      expect('keyHash' in result).toBe(false);
      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all keys mapped to response DTOs without keyHash', async () => {
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

      const result = await service.findAll();

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ApiKey,
        {},
        { orderBy: { createdAt: 'DESC' } },
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('key-1');
      expect(result[1].id).toBe('key-2');
      result.forEach((r) => {
        expect('keyHash' in r).toBe(false);
        expect('key' in r).toBe(false);
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

  describe('validateKey', () => {
    const buildCandidate = (hash: string): ApiKey =>
      ({
        id: 'key-1',
        keyHash: hash,
        label: 'Test Key',
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as ApiKey;

    it('returns ApiKey when raw key matches', async () => {
      const candidate = buildCandidate('$argon2id$...');
      mockEntityManager.find.mockResolvedValueOnce([candidate]);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      const result = await service.validateKey('omk_validraw');

      expect(mockEntityManager.find).toHaveBeenCalledWith(ApiKey, { revokedAt: null });
      expect(argon2.verify).toHaveBeenCalledWith('$argon2id$...', 'omk_validraw');
      expect(result).toBe(candidate);
      expect(result?.lastUsedAt).toBeInstanceOf(Date);
    });

    it('returns null when no key matches', async () => {
      const candidate = buildCandidate('$argon2id$...');
      mockEntityManager.find.mockResolvedValueOnce([candidate]);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validateKey('omk_wrongraw');

      expect(result).toBeNull();
    });

    it('returns null when there are no non-revoked keys', async () => {
      mockEntityManager.find.mockResolvedValueOnce([]);

      const result = await service.validateKey('omk_anything');

      expect(result).toBeNull();
      expect(argon2.verify).not.toHaveBeenCalled();
    });
  });
});

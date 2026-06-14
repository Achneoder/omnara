import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller.js';
import { ApiKeysService } from './api-keys.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApiKeyResponseDto } from './dto/api-key-response.dto.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';

const mockApiKeysService = {
  findBySite: jest.fn(),
  generate: jest.fn(),
  revoke: jest.fn(),
};

describe('ApiKeysController', () => {
  let controller: ApiKeysController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
      providers: [{ provide: ApiKeysService, useValue: mockApiKeysService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ApiKeysController>(ApiKeysController);
  });

  describe('findBySite', () => {
    it('returns list of non-revoked keys for the site', async () => {
      const keys: ApiKeyResponseDto[] = [
        {
          id: 'key-1',
          label: 'Production Key',
          siteId: 'site-1',
          lastUsedAt: null,
          revokedAt: null,
          createdAt: new Date('2024-01-01'),
        },
      ];
      mockApiKeysService.findBySite.mockResolvedValueOnce(keys);

      const result = await controller.findBySite('site-1');

      expect(mockApiKeysService.findBySite).toHaveBeenCalledWith('site-1');
      expect(result).toBe(keys);
    });
  });

  describe('generate', () => {
    it('passes merged dto to service and returns response with plaintext key', async () => {
      const dto: CreateApiKeyDto = { label: 'New Key', siteId: 'site-1' };
      const response: ApiKeyResponseDto = {
        id: 'key-new',
        label: 'New Key',
        siteId: 'site-1',
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date(),
        plainTextKey: 'omk_abc123',
      };
      mockApiKeysService.generate.mockResolvedValueOnce(response);

      const result = await controller.generate('site-1', dto);

      expect(mockApiKeysService.generate).toHaveBeenCalledWith({
        label: 'New Key',
        siteId: 'site-1',
      });
      expect(result).toBe(response);
      expect(result.plainTextKey).toBe('omk_abc123');
    });

    it('propagates NotFoundException when site not found', async () => {
      mockApiKeysService.generate.mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.generate('missing-site', { label: 'Key', siteId: 'missing-site' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('revoke', () => {
    it('delegates revocation to service', async () => {
      mockApiKeysService.revoke.mockResolvedValueOnce(undefined);

      await controller.revoke('key-1');

      expect(mockApiKeysService.revoke).toHaveBeenCalledWith('key-1');
    });

    it('propagates NotFoundException when key not found', async () => {
      mockApiKeysService.revoke.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.revoke('missing-key')).rejects.toThrow(NotFoundException);
    });
  });
});

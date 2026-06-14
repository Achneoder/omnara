import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { ActivityLogService } from './activity-log.service.js';
import { ActivityLog } from './entities/activity-log.entity.js';
import { ListActivityDto } from './dto/list-activity.dto.js';

const mockEntityManager = {
  find: jest.fn(),
  findOne: jest.fn(),
  persist: jest.fn(),
  flush: jest.fn(),
  getReference: jest.fn(),
};

describe('ActivityLogService', () => {
  let service: ActivityLogService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityLogService, { provide: EntityManager, useValue: mockEntityManager }],
    }).compile();

    service = module.get<ActivityLogService>(ActivityLogService);
  });

  describe('log', () => {
    it('creates and flushes an activity log entry', async () => {
      mockEntityManager.getReference.mockReturnValueOnce({ id: 'site-1' });
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.log({
        action: 'content_type.created',
        entityType: 'ContentType',
        entityId: 'ct-1',
        siteId: 'site-1',
      });

      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('creates log entry without siteId', async () => {
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.log({
        action: 'auth.login',
        entityType: 'User',
      });

      expect(mockEntityManager.getReference).not.toHaveBeenCalled();
      expect(mockEntityManager.persist).toHaveBeenCalled();
      expect(mockEntityManager.flush).toHaveBeenCalled();
    });

    it('assigns sessionId and metadata when provided', async () => {
      mockEntityManager.persist.mockReturnValueOnce(undefined);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      await service.log({
        action: 'content_entry.created',
        entityType: 'ContentEntry',
        sessionId: 'session-abc',
        metadata: { key: 'value' },
      });

      const persisted = mockEntityManager.persist.mock.calls[0][0] as ActivityLog;
      expect(persisted.sessionId).toBe('session-abc');
      expect(persisted.metadata).toEqual({ key: 'value' });
    });
  });

  describe('findAll', () => {
    it('returns activity logs with default limit of 100', async () => {
      const logs = [{ id: 'log-1' }] as ActivityLog[];
      mockEntityManager.find.mockResolvedValueOnce(logs);

      const result = await service.findAll({});

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ActivityLog,
        {},
        expect.objectContaining({ limit: 100, orderBy: { createdAt: 'DESC' } }),
      );
      expect(result).toBe(logs);
    });

    it('filters by siteId', async () => {
      mockEntityManager.find.mockResolvedValueOnce([]);

      const filters: ListActivityDto = { siteId: 'site-1' };
      await service.findAll(filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ActivityLog,
        expect.objectContaining({ site: { id: 'site-1' } }),
        expect.anything(),
      );
    });

    it('filters by action', async () => {
      mockEntityManager.find.mockResolvedValueOnce([]);

      const filters: ListActivityDto = { action: 'content_type.created' };
      await service.findAll(filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ActivityLog,
        expect.objectContaining({ action: 'content_type.created' }),
        expect.anything(),
      );
    });

    it('filters by date range', async () => {
      mockEntityManager.find.mockResolvedValueOnce([]);

      const filters: ListActivityDto = {
        createdAfter: '2026-01-01T00:00:00Z',
        createdBefore: '2026-12-31T00:00:00Z',
      };
      await service.findAll(filters);

      expect(mockEntityManager.find).toHaveBeenCalledWith(
        ActivityLog,
        expect.objectContaining({
          createdAt: {
            $gte: new Date('2026-01-01T00:00:00Z'),
            $lte: new Date('2026-12-31T00:00:00Z'),
          },
        }),
        expect.anything(),
      );
    });
  });
});

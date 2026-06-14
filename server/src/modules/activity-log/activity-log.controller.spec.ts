import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogController } from './activity-log.controller.js';
import { ActivityLogService } from './activity-log.service.js';
import { ActivityLog } from './entities/activity-log.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ListActivityDto } from './dto/list-activity.dto.js';

const mockActivityLogService = {
  findAll: jest.fn(),
};

describe('ActivityLogController', () => {
  let controller: ActivityLogController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityLogController],
      providers: [{ provide: ActivityLogService, useValue: mockActivityLogService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ActivityLogController>(ActivityLogController);
  });

  describe('findAll', () => {
    it('returns activity logs from service', async () => {
      const logs = [{ id: 'log-1' }] as ActivityLog[];
      mockActivityLogService.findAll.mockResolvedValueOnce(logs);

      const filters: ListActivityDto = { action: 'content_type.created' };
      const result = await controller.findAll(filters);

      expect(mockActivityLogService.findAll).toHaveBeenCalledWith(filters);
      expect(result).toBe(logs);
    });

    it('passes empty filters when none provided', async () => {
      mockActivityLogService.findAll.mockResolvedValueOnce([]);

      await controller.findAll({});

      expect(mockActivityLogService.findAll).toHaveBeenCalledWith({});
    });
  });
});

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ActivityLogService } from './activity-log.service.js';
import { ListActivityDto } from './dto/list-activity.dto.js';
import { ActivityLog } from './entities/activity-log.entity.js';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(@Query() filters: ListActivityDto): Promise<ActivityLog[]> {
    return this.activityLogService.findAll(filters);
  }
}

import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';

function parseOptionalInt(value?: string): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

@Roles('manager')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query('week') week: string, @Query('userId') userId?: string, @Query('projectId') projectId?: string) {
    return this.dashboardService.getSummary(week, parseOptionalInt(userId), parseOptionalInt(projectId));
  }

  @Get('team-status')
  getTeamStatus(@Query('week') week: string) {
    return this.dashboardService.getTeamStatus(week);
  }

  @Get('tasks-trend')
  getTasksTrend(@Query('weeks') weeks?: string) {
    return this.dashboardService.getTasksTrend(weeks ? parseInt(weeks, 10) : 8);
  }

  @Get('workload-by-project')
  getWorkloadByProject(@Query('week') week: string, @Query('userId') userId?: string) {
    return this.dashboardService.getWorkloadByProject(week, parseOptionalInt(userId));
  }

  @Get('time-by-type')
  getTimeByType(@Query('week') week: string, @Query('userId') userId?: string, @Query('projectId') projectId?: string) {
    return this.dashboardService.getTimeByType(week, parseOptionalInt(userId), parseOptionalInt(projectId));
  }

  @Get('activity-feed')
  getActivityFeed(@Query('limit') limit?: string) {
    return this.dashboardService.getActivityFeed(limit ? parseInt(limit, 10) : 10);
  }

  @Get('section-view')
  getSectionView(
    @Query('week') week: string,
    @Query('section') section: string,
    @Query('userId') userId?: string,
    @Query('projectId') projectId?: string,
  ) {
    if (section !== 'blockers' && section !== 'achievements') {
      throw new BadRequestException('section must be "blockers" or "achievements".');
    }
    return this.dashboardService.getSectionView(week, section, parseOptionalInt(userId), parseOptionalInt(projectId));
  }
}

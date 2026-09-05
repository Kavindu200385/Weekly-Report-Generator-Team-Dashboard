import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Roles('manager')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query('week') week: string) {
    return this.dashboardService.getSummary(week);
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
  getWorkloadByProject(@Query('week') week: string) {
    return this.dashboardService.getWorkloadByProject(week);
  }

  @Get('time-by-type')
  getTimeByType(@Query('week') week: string) {
    return this.dashboardService.getTimeByType(week);
  }

  @Get('activity-feed')
  getActivityFeed(@Query('limit') limit?: string) {
    return this.dashboardService.getActivityFeed(limit ? parseInt(limit, 10) : 10);
  }

  @Get('section-view')
  getSectionView(@Query('week') week: string, @Query('section') section: string) {
    if (section !== 'blockers' && section !== 'achievements') {
      throw new BadRequestException('section must be "blockers" or "achievements".');
    }
    return this.dashboardService.getSectionView(week, section);
  }
}

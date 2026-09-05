import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';
import { ReportVersion } from '../reports/entities/report-version.entity';
import { ReportTask } from '../reports/entities/report-task.entity';
import { ReportHoursByType } from '../reports/entities/report-hours.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { ReportAchievement } from '../reports/entities/report-achievement.entity';
import { ReportReview } from '../reports/entities/report-review.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Report,
      ReportVersion,
      ReportTask,
      ReportHoursByType,
      ReportBlocker,
      ReportAchievement,
      ReportReview,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

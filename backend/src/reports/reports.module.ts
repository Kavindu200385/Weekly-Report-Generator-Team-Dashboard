import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportVersion } from './entities/report-version.entity';
import { ReportTask } from './entities/report-task.entity';
import { ReportBlocker } from './entities/report-blocker.entity';
import { ReportAchievement } from './entities/report-achievement.entity';
import { ReportHoursByType } from './entities/report-hours.entity';
import { ReportReview } from './entities/report-review.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportVersion,
      ReportTask,
      ReportBlocker,
      ReportAchievement,
      ReportHoursByType,
      ReportReview,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

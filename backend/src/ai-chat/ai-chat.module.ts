import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../reports/entities/report.entity';
import { ReportVersion } from '../reports/entities/report-version.entity';
import { ReportTask } from '../reports/entities/report-task.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { ReportAchievement } from '../reports/entities/report-achievement.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportVersion,
      ReportTask,
      ReportBlocker,
      ReportAchievement,
      Project,
      User,
    ]),
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}

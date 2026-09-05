import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Report } from '../reports/entities/report.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Report, ReportBlocker])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

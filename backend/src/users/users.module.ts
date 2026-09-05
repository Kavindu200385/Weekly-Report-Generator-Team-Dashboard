import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Invite } from './entities/invite.entity';
import { Report } from '../reports/entities/report.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invite, Report, ReportBlocker])],
  controllers: [UsersController, InvitesController],
  providers: [UsersService, InvitesService],
  exports: [InvitesService],
})
export class UsersModule {}

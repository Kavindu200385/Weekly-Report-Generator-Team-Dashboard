import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Invite } from './entities/invite.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { Report } from '../reports/entities/report.entity';
import { ReportBlocker } from '../reports/entities/report-blocker.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { PasswordResetsService } from './password-resets.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invite, PasswordReset, Report, ReportBlocker])],
  controllers: [UsersController, InvitesController],
  providers: [UsersService, InvitesService, PasswordResetsService],
  exports: [InvitesService, PasswordResetsService],
})
export class UsersModule {}

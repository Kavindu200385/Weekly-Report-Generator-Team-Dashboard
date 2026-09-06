import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PasswordResetsService } from './password-resets.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { UserRole } from './entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Roles('manager')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetsService: PasswordResetsService,
  ) {}

  @Get()
  findAll(@Query('role') role?: UserRole, @Query('includeInactive') includeInactive?: string) {
    return this.usersService.findAll(role, includeInactive === 'true');
  }

  @Get('pending-registrations')
  findPendingRegistrations() {
    return this.usersService.findPendingRegistrations();
  }

  @Get('password-reset-requests')
  findPasswordResetRequests() {
    return this.passwordResetsService.findRequested();
  }

  @Post(':id/reset-password')
  async createResetLink(@Param('id', ParseIntPipe) id: number) {
    const token = await this.passwordResetsService.createResetToken(id);
    return { token };
  }

  @Patch(':id/approve')
  approveRegistration(@Param('id', ParseIntPipe) id: number, @Body() dto: ApproveRegistrationDto) {
    return this.usersService.approveRegistration(id, dto);
  }

  @Patch(':id/role')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto);
  }

  @Patch(':id')
  updateDetails(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDetailsDto) {
    return this.usersService.updateDetails(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDelete(id);
  }

  @Get(':id/profile')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProfile(id);
  }
}

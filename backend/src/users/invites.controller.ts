import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Roles('manager')
  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateInviteDto) {
    return this.invitesService.create(user.sub, dto);
  }

  @Roles('manager')
  @Get()
  findPending() {
    return this.invitesService.findPending();
  }

  @Roles('manager')
  @Delete(':id')
  revoke(@Param('id', ParseIntPipe) id: number) {
    return this.invitesService.revoke(id);
  }

  @Public()
  @Get(':token')
  async validate(@Param('token') token: string) {
    const invite = await this.invitesService.findValidByToken(token);
    return { email: invite.email, role: invite.role };
  }
}

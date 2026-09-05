import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterReportsDto } from './dto/filter-reports.dto';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.sub, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: CurrentUserPayload, @Query() filter: FilterReportsDto) {
    return this.reportsService.findMine(user.sub, filter);
  }

  @Roles('manager')
  @Get('team')
  findTeam(@Query() filter: FilterReportsDto) {
    return this.reportsService.findTeam(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.reportsService.findOneDetailed(id, user.sub, user.role);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, user.sub, dto);
  }

  @Post(':id/submit')
  submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.reportsService.submit(id, user.sub);
  }

  @Get(':id/versions')
  getVersions(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserPayload) {
    return this.reportsService.getVersions(id, user.sub, user.role);
  }

  @Get(':id/versions/:versionId')
  getVersion(
    @Param('id', ParseIntPipe) id: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getVersion(id, versionId, user.sub, user.role);
  }
}

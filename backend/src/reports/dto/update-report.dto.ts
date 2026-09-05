import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskItemDto } from './task-item.dto';
import { BlockerItemDto } from './blocker-item.dto';
import { AchievementItemDto } from './achievement-item.dto';
import { HoursItemDto } from './hours-item.dto';

export class UpdateReportDto {
  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsDateString()
  weekStartDate?: string;

  @IsOptional()
  @IsDateString()
  weekEndDate?: string;

  @IsOptional()
  @IsString()
  tasksPlannedNextWeek?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskItemDto)
  tasks?: TaskItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockerItemDto)
  blockers?: BlockerItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementItemDto)
  achievements?: AchievementItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoursItemDto)
  hoursByType?: HoursItemDto[];
}

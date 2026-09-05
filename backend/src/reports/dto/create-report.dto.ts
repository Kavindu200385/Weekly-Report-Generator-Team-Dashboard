import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  projectId: number;

  @IsDateString()
  weekStartDate: string;

  @IsDateString()
  weekEndDate: string;

  @IsOptional()
  @IsString()
  tasksPlannedNextWeek?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

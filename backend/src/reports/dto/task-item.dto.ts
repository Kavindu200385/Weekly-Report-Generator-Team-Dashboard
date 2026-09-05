import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class TaskItemDto {
  @IsNotEmpty()
  @IsString()
  taskName: string;

  @IsNotEmpty()
  @IsString()
  priority: string;

  @IsInt()
  @Min(0)
  @Max(100)
  plannedPct: number;

  @IsInt()
  @Min(0)
  @Max(100)
  actualPct: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  timePlannedHrs: number;

  @IsNotEmpty()
  timeSpentHrs: number;

  @IsOptional()
  @IsString()
  outputDeliverable?: string;
}

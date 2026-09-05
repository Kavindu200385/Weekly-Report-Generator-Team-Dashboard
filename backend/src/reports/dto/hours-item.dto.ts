import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskType } from '../entities/report-hours.entity';

export class HoursItemDto {
  @IsEnum(TaskType)
  taskType: TaskType;

  @IsNotEmpty()
  hours: number;
}

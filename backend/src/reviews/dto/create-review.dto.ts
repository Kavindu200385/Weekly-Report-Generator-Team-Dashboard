import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportReviewAction } from '../../reports/entities/report-review.entity';

export class CreateReviewDto {
  @IsEnum(ReportReviewAction)
  action: ReportReviewAction;

  @IsOptional()
  @IsString()
  comment?: string;
}

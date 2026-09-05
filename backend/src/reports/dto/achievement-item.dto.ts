import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AchievementItemDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isKeyAchievement?: boolean;
}

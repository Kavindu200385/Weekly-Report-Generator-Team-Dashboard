import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BlockerItemDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isKeyIssue?: boolean;
}
